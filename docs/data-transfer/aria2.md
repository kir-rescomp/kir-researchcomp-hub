# Downloading data with aria2

Fetching large datasets from public repositories (ENA, SRA, ENSEMBL, GEO, etc.)
is one of the most common tasks on the cluster and one of the easiest to get
wrong. This page explains why `wget` often struggles, when to reach for
[`aria2`](https://aria2.github.io/) ( BMRC provides this is a module)  instead, and how to use it
**without saturating the cluster's shared network and storage.**

!!! clipboard-list "TL;DR"

    - `wget` over FTP is fragile for large multi-file downloads and gives you
     **no integrity checking** — aborted transfers leave silently corrupt files.
        - `aria2c` resumes cleanly, retries with backoff, and parallelises safely.
          - **Be a good neighbour.** The data-transfer network and `/well` storage are
            *shared*. Use modest connection counts (see [Polite usage](#polite-usage)).
              - **Always verify checksums** after downloading. An exit code of `0` is not
                proof the data is intact.

---

## Why not just use `wget`?

`wget` is perfectly fine for a handful of small files. It starts to hurt on
large scale pulls (hundreds of multi-gigabyte FASTQs,etc) for a few
reasons:

- **FTP transfers abort mid-stream.** Public FTP endpoints throttle or reset
  long-running connections. `wget` retries from where it can, but you'll often
  see it loop in retry mode making little progress:

    ```text
    ==> RETR SRR2314037_1.fastq.gz ... done.
    Length: 851494632 (812M), 314857192 (300M) remaining (unauthoritative)
    Data transfer aborted.
    Retrying.
    ```

- **No integrity guarantee.** If a transfer is silently truncated, `wget`
  cannot tell you the file is incomplete — you only find out when a downstream
  tool (alignment, `zcat`, etc.) chokes on a corrupt gzip.

- **Serial by default.** One file at a time, one connection each. Slow for
  large batches.

!!! lightbulb "Switch FTP → HTTPS"
    Most repositories (such as ENA) serve the **same files over HTTPS**. HTTPS
    is far more robust than FTP for long transfers. The host usually stays the
    same — only the scheme changes:

    ```text
    ftp://ftp.sra.ebi.ac.uk/vol1/fastq/...   ❌ fragile
    https://ftp.sra.ebi.ac.uk/vol1/fastq/... ✅ preferred
    ```

---

## Getting aria2

`aria2c` is available as a module on the cluster:

<div class="nord" markdown="1">
```py
module load aria2      # (1)!
aria2c --version
```

1.  Check the exact module name/version with `module spider aria2` — the
    default may lag behind the newest release.

---

## Basic usage

Feed `aria2c` a plain text file with **one URL per line** using `-i`:

```py
aria2c -i urls.txt
```

### Building the URL list

If you have an ENA "download all" shell script full of `wget` lines, convert it
to a clean URL list and switch FTP → HTTPS in one step:

```py
grep -oP 'ftp://\S+' ena-download.sh \
  | sed 's#ftp://ftp.sra.ebi.ac.uk#https://ftp.sra.ebi.ac.uk#' \
  > urls.txt

wc -l urls.txt   # sanity-check the count matches what you expect
```

!!! warning "Eyeball the list before downloading"
    `grep -oP '\S+'` grabs everything non-whitespace after the scheme. If any
    source line has trailing flags or comments after the URL, they'll be
    captured too. A quick `head urls.txt` / `wc -l` saves you a confusing
    failure  halfway through the fetch.

---

## The recommended command

For a typical large batch from a single repository, this is a sensible,
**cluster-friendly** starting point:

```py
aria2c -x 4 -j 2 -c \
  --retry-wait=10 --max-tries=0 \
  --auto-file-renaming=false --conditional-get=true \
  -i urls.txt
```

### What each flag does

| Flag                         | Long form                       | Meaning                                                      |
| ---------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `-x 4`                       | `--max-connection-per-server=4` | Max connections to a **single server** (cap is 16).          |
| `-s N`                       | `--split=N`                     | Split each file into up to *N* segments. Effective parallelism per file is capped by the lower of `-x`/`-s`, so with `-x 4` you can omit this. |
| `-j 2`                       | `--max-concurrent-downloads=2`  | How many **separate files** download at once.                |
| `-c`                         | `--continue`                    | **Resume** a partial download instead of restarting. This is the flag that fixes the `wget` corruption problem. |
| `--retry-wait=10`            |                                 | Wait 10 s between retries (backoff, don't hammer).           |
| `--max-tries=0`              |                                 | Retry indefinitely (0 = unlimited).                          |
| `--auto-file-renaming=false` |                                 | Don't create `file.1`, `file.2`… on collision — overwrite/resume the real file. |
| `--conditional-get=true`     |                                 | Skip re-downloading if the local file is already up to date. |

!!! square-pen "`-x` vs `-j` — total connection count"
    Total concurrent connections ≈ `-x × -j`. With `-x 4 -j 2` that's up to
    **8 connections** — plenty fast, and gentle on shared infrastructure.

---

## Polite usage — don't melt the pipes { #polite-usage }

!!! danger "The data-transfer network and `/well` are shared resources"
    Every byte you pull comes in over the **same egress links** and lands on the
    **same shared parallel filesystem** everyone else is using. `aria2c` can open
    up to `16 × N` connections — enough to degrade transfer performance for the
    whole cluster and get you throttled (or blocked) by the remote server.

Guidelines:

- **Stay modest.** `-x 4 -j 2` is a good default. Do **not** crank `-x` to 16
  "to go faster" — you'll likely get rate-limited by the remote end and hurt
  your neighbours for no real gain.
- **If you see aborts, go *lower*, not higher.** Drop to `-x 2 -j 1`. Aborts
  usually mean the remote server is pushing back, not that you need more
  connections.
- **Download to the right place.** Pull large datasets into project storage
  under `/well/<project>/...`, not into your home directory.
- **Run big pulls in a session that won't die.** Use a `tmux`/`screen` session
  on a login node, or better, submit as a job. Don't run 500 GB downloads on a
  compute node's interactive shell that may time out.
- **Deduplicate.** Check whether the dataset already exists in a shared
  reference/data area before pulling your own copy.

!!! question "Very large or recurring pulls?"
    For pipelines you'll rerun, or for hundreds of accessions with provenance
    requirements, consider [`nf-core/fetchngs`](https://nf-co.re/fetchngs) — it
    slots into Slurm, handles retries and checksums, and gives you a
    reproducible record. Get in touch with the Research Computing team if you'd
    like help setting it up.

---

## Always verify checksums

An exit code of `0` does **not** prove your files are intact. Silent truncation
is exactly the failure mode that bites people downstream. For ENA, pull the
published MD5s from the API and check against them:

```py
curl -s "https://www.ebi.ac.uk/ena/portal/api/filereport?accession=SRP063496&result=read_run&fields=fastq_ftp,fastq_md5&format=tsv" \
  -o SRP063496_md5.tsv
```

Then build a manifest and validate all files in one go:

```py
# Parse the fastq_md5 / fastq_ftp columns into a `md5sum -c` manifest
# (each field may contain ';'-separated values for paired-end reads)
tail -n +2 SRP063496_md5.tsv | while IFS=$'\t' read -r ftp md5; do
  IFS=';' read -ra urls <<< "$ftp"
  IFS=';' read -ra sums <<< "$md5"
  for i in "${!urls[@]}"; do
    echo "${sums[$i]}  $(basename "${urls[$i]}")"
  done
done > md5_manifest.txt

md5sum -c md5_manifest.txt   # re-download anything reported as FAILED
```

!!! success "If a file fails the checksum"
    Delete the offending `.fastq.gz` **and** its `.aria2` control file, then
    re-run the same `aria2c -i urls.txt` command — completed files are skipped,
    so only the broken ones are re-fetched.

---

## Quick reference

```py
# 1. Build URL list (FTP → HTTPS)
grep -oP 'ftp://\S+' ena-download.sh \
  | sed 's#ftp://ftp.sra.ebi.ac.uk#https://ftp.sra.ebi.ac.uk#' > urls.txt

# 2. Download politely, with resume + retries
aria2c -x 4 -j 2 -c --retry-wait=10 --max-tries=0 \
  --auto-file-renaming=false --conditional-get=true -i urls.txt

# 3. Verify
md5sum -c md5_manifest.txt
```
</div>
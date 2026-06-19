# Data Integrity

<p align="center">
    <img src="{{ config.site_url }}assets/images/technical_essays/md5sum_sha256.png" alt="checksum-logo" width="250"/>
</p>


Data downloaded from external sources is the starting point for all future analyses and conclusions. It is important to explicitly verify transferred data with **checksums** — compact cryptographic summaries computed in a way that even a single changed bit produces a completely different value. Checksums also serve as a reliable proxy for data versioning: a checksum uniquely identifies an exact snapshot of a file, which means you can link a particular analysis and its results to a specific version of input data.

!!! circle-info "MD5 and SHA-256"

    The two most common checksum algorithms are **MD5** and **SHA-256**.
    
    | Algorithm | Output size | Notes |
    |-----------|-------------|-------|
    | MD5       | 128-bit (32 hex chars) | Fast; still widely used for accidental-corruption checks, but cryptographically broken — do not use for security |
    | SHA-256   | 256-bit (64 hex chars) | Current standard; adopted as FIPS 180-4; preferred for all new workflows |
    
    Most data repositories (NCBI, EBI, Zenodo, figshare) now publish SHA-256 checksums alongside downloads. Use SHA-256 when you have a choice.

!!! terminal-2 "Computing checksums on the command line"

    Pass a file directly or pipe a string through standard input:
    <div class="nord" markdown="1">
    ```py
    # File input
    sha256sum mydata.fastq.gz
    md5sum    mydata.fastq.gz
    
    # String input — note: a single character difference produces a completely different hash
    echo "shell for Bioinformatics" | md5sum
    echo "shell for BioInformatics" | md5sum
    ```
    >```py
    >3b4e6f… mydata.fastq.gz
    >198638c380be53bf3f6ff70d5626ae44  -
    >afa4dbcc56b540e24558085fdc10342f  -
    >```
    </div>

    Checksums are reported in hexadecimal (digits `0–9` and letters `a–f`). The trailing `-` indicates input came from standard in rather than a named file.

!!! terminal "Batch verification with a checksum manifest"

    Repositories frequently supply a manifest file (e.g. `checksums.md5` or `sha256sums.txt`) listing expected hashes for every file in a dataset. Verify all files in one step with the `-c` (`--check`) flag:
    
    <div class="nord" markdown="1">
    ```py
    sha256sum -c sha256sums.txt
    md5sum    -c checksums.md5
    ```
    >``py
    >sample1.fastq.gz: OK
    >sample2.fastq.gz: OK
    >sample3.fastq.gz: FAILED
    >md5sum: WARNING: 1 computed checksum did NOT match
    >```
    </div>

    Any `FAILED` line means the file is corrupted or has been replaced since the manifest was created — re-download before proceeding.

!!! lightbulb "Integrating checksums into your workflow"

    For reproducible pipelines, record checksums of all input datasets at the time of download and store them alongside your analysis scripts.
    
    **Snakemake** — snapshot input hashes in a dedicated rule or log file:

    <div class="nord" markdown="1">
    ```python
    rule verify_inputs:
        input:
            expand("data/raw/{sample}.fastq.gz", sample=config["samples"])
        output:
            "data/raw/sha256sums.txt"
        shell:
            "sha256sum {input} > {output}"
    ```
    
    **Shell one-liner** — generate a manifest for everything in a directory:
    
    ```py
    sha256sum data/raw/*.fastq.gz > data/raw/sha256sums.txt
    ```
    
    Commit `sha256sums.txt` to version control alongside your workflow. Anyone re-running the analysis can confirm they are working with identical input data.
    
    **Python** — compute checksums programmatically for large files without loading them fully into memory:
    
    ```python
    import hashlib, pathlib
    
    def sha256(path: str | pathlib.Path, chunk: int = 1 << 20) -> str:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            while data := f.read(chunk):
                h.update(data)
        return h.hexdigest()
    
    print(sha256("data/raw/sample1.fastq.gz"))
    ```
    </div>

!!! cloud-bolt "Corrupted data rarely produces obvious errors"

    The example below is a real log entry from a failed `bedtools genomecov` job on an HPC cluster:
    
    ```
    terminate called after throwing an instance of 'std::bad_alloc'
    what(): std::bad_alloc
    ```
    
    `std::bad_alloc` is a C++ out-of-memory exception. The natural instinct is to request more memory and resubmit — in this case the job was re-run with 0.5 TB RAM with the same result. The actual cause was a **corrupted `.bed` file**: the data passed format validation but contained subtle corruption that only surfaced at runtime.
    
    Verifying checksums immediately after download catches corruption before it propagates into a long, expensive compute job.


## Verify CosMx data 

Running `md5sum -c` for .csv files in a CosMx dataset will trigger the following error 

<div class="nord" markdown="1">
```py
md5sum: Filename.csv: no properly formatted MD5 checksum lines found
```

CosMx CSV has a header row and uses comma-separation, but `md5sum -c` expects the format <hash>  <filename> (two-space separated, no header). A quick awk one-liner fixes it:

Solution is to create an intermediate file as below ( Run this command from the parent directory) 

```py
awk -F',' 'NR>1 {print $1 "  " $2}' md5sum/FileName.csv > ./FileName.txt
```
You should see the `FileName.txt` in the parent directory

```py
# tree -L 1
.
├── DecodedFiles
├── flatFiles
├── md5sum
├── FileName.txt
├── seuratObject_Mouse.back.skin.HDGF.RDS
└── TileDB
```

Now run the following for verification 

```py
md5sum -c FileName.txt
```
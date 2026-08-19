# MEGAHIT

MEGAHIT is an ultra-fast and memory-efficient NGS assembler. It is optimized for metagenomes, but also works well on generic single genome assembly (small or mammalian size) and single-cell assembly.

!!! quote ""
    - **Home** https://github.com/voutcn/MEGAHIT
    - **License** - This project is licensed under the GPLv3 License - see the [LICENSE](https://github.com/voutcn/megahit/blob/master/LICENSE) file for details


A typical invocation supplies paired-end and, optionally, single-end reads,
together with a thread count, a memory budget, and an output directory:

<div class="nord" markdown="1">
```py
megahit -t 8 -m 0.85 \
  -1 sample.fastq.1.gz \
  -2 sample.fastq.2.gz \
  -r sample.fastq.3.gz \
  -o output_dir
```
</div>

!!! note-sticky "Specify the memory budget as a fraction"
    The `-m` / `--memory` option accepts either an absolute value **in bytes**
    or a fraction of available memory when the value is between 0 and 1.
    Passing `-m 48` therefore requests 48 *bytes*, not 48 GB, which is almost
    never intended. Prefer the fraction form, for example `-m 0.85`, which
    scales with the memory available to the job and removes the ambiguity.


## A known stalling behaviour

There have been several reports of MEGAHIT stalling at a specific point in its
execution: after read parsing has completed and immediately before, or during
the transition into, graph construction — that is, within or immediately after
the `megahit_core buildlib` step.

The signature in the log is distinctive. A healthy run reports each input
library and then proceeds into the assembly phases:

```text
... Lib 0 (...fastq.1.gz,...fastq.2.gz): pe, 228695948 reads, 150 max length
... Lib 1 (...fastq.3.gz): se, 1694999 reads, 150 max length
... Start assembly. Number of CPU threads 8
... k list: 21,29,39,59,79,99,119,141
... Extract solid (k+1)-mers for k = 21
```

A stalled run instead logs the first library and then produces no further
output — no subsequent library, no assembly phase — while the process remains
alive:

```text
... Lib 0 (...fastq.1.gz,...fastq.2.gz): pe, 256495626 reads, 150 max length
(no further output)
```

Inspecting the node during a stall typically shows the MEGAHIT processes in an
uninterruptible or sleeping state (`D` or `S` in `top`), with an associated
zombie (`Z`) child, and no process consuming CPU. The job makes no further
progress and is eventually terminated by the partition wall-time limit.

!!! warning "First, verify the input data"
    Before attributing a stall to the cause described below, confirm that the
    input files are intact. A truncated or corrupt gzip stream can produce a
    similar hang during read parsing. Test each input with:

    ```bash
    gzip -t sample.fastq.1.gz && \
    gzip -t sample.fastq.2.gz && \
    gzip -t sample.fastq.3.gz && echo "all inputs intact"
    ```

    An exit status of `0` for every file confirms the compressed streams are
    intact. The remainder of this section assumes the inputs have been
    verified.

## Cause: shared filesystem contention

Where the inputs are verified as intact, the stall is understood to arise from
contention on the shared parallel filesystem.

MEGAHIT is disk-backed. During read-library construction and graph building it
writes and re-reads a substantial volume of intermediate data — the binary read
library, solid *k*-mer files, and the succinct de Bruijn graph structures at
each value of *k*. By default these intermediates are written to a `tmp/`
subdirectory **inside the output directory** (for example
`output_dir/tmp/`). When the output directory resides on `/well/`, all of this
intermediate input/output is directed at the shared GPFS filesystem.

The `/well/` filesystem is served to compute nodes over the cluster network by
a finite set of storage servers backing a shared pool of disks. When that
serving layer is under load, client-side input/output operations can block for
extended periods. MEGAHIT's read-library and graph-construction phases are
particularly sensitive to this, as they are the most input/output-intensive
part of the run. The result is a process that is alive but making no progress,
consistent with the observed stall.

This behaviour is intermittent: the same job may complete when the filesystem
is quiet and stall when it is under load. That intermittency is itself
consistent with a contention-based explanation rather than a fault in the input
data or in MEGAHIT.

## Tested solution: redirect intermediates to node-local disk

The tested mitigation is to direct MEGAHIT's intermediate files to node-local
disk rather than to the shared filesystem, using the `--tmp-dir` option. Only
the final assembly output is then written back to `/well/`; the
input/output-intensive intermediate work stays on local disk, off the shared
storage path.

!!! exclamation "`TMPDIR` alone has no effect"
    MEGAHIT does **not** honour the `TMPDIR` environment variable for its
    intermediate files. Exporting `TMPDIR` has no bearing on where MEGAHIT
    writes. The location must be set explicitly with the `--tmp-dir` command
    line option.

### Local disk capacity must be respected

Node-local disk is a small, shared resource and must be used with care.

!!! danger "Local disk is limited and shared - ~160GB per node"
    Each compute node provides on the order of **160 GB** of local disk in
    total, shared by **all jobs running on that node**. A single MEGAHIT
    assembly of approximately 276 million reads  (fq1 + fq2 + fq3) can consume up to **25 GB** of
    that space, and the intermediate footprint scales with the size of the
    input. Larger libraries consume proportionally more.

    Before adopting node-local scratch for a given dataset, confirm that the
    intermediate footprint of the largest sample will fit within the available
    local capacity, allowing headroom for other jobs sharing the node.
    Redirecting intermediates to a local disk that subsequently fills will
    cause the assembly to fail with an out-of-space error rather than a stall.
    Such a failure is safe to resubmit; it indicates the node's local disk was
    full, not a problem with the input data.

### Controlling aggregate local disk usage across many jobs

When a cohort of assemblies is submitted together. For example through
cgatcore. several of the jobs may be scheduled onto the same compute node.
Because they share that node's local disk, their combined intermediate
footprint, rather than any single job's, is what must fit within the available
local capacity.

On a shared cluster there is no reliable way to guarantee that independent jobs
are placed on separate nodes without reserving whole nodes, which is not
practical at the scale of hundreds of assemblies. The realistic objective is
therefore not to prevent co-location but to ensure that co-location cannot
exhaust the local disk. This is achieved by bounding the number of jobs in
flight at once so that, even in the worst case of several landing on one node,
their combined footprint stays within capacity with headroom for other users.

The relevant lever is the concurrency limit on submission. `cgatcore` caps the
number of concurrently submitted jobs, which in turn bounds how many can occupy
any one node. To size that cap, measure the peak local-disk footprint of a
representative large sample and choose a concurrency limit such that a plausible
worst-case number of co-located jobs remains comfortably below the node's local
capacity.

!!! tip "Measure the real footprint first"
    The per-sample footprint scales with input size, so the **276 million** read
    figure above should not be extrapolated linearly with confidence. Measure
    the actual peak local-disk use of one representative large assembly. For
    example by monitoring the `--tmp-dir` path with `du -sh` at intervals, or
    watching `df` on the node's local filesystem during a run and base the
    concurrency limit on that measured value.

## Example Slurm script

The following script directs MEGAHIT's intermediates to node-local scratch
under a job-scoped path, and cleans that path up on exit or cancellation.

<div class="nord" markdown="1">
```c
#!/bin/bash

#SBATCH --job-name      megahit-test
#SBATCH --time          1-00:00:00
#SBATCH --cpus-per-task 8
#SBATCH --mem           100G
#SBATCH --output        slog/%j.out

module purge
module load MEGAHIT/1.2.9-GCCcore-12.2.0

# $TMPDIR is already set on the compute nodes, but we customise it here so that
# our own cleanup function can remove it reliably.
export TMPDIR=/tmp/slurm-${SLURM_JOB_ID}/megahit
mkdir -p "$TMPDIR"

# Register cleanup. This runs automatically on exit, cancellation, or interrupt.
# Do not call it yourself.
clean_temp() { rm -rf "/tmp/slurm-${SLURM_JOB_ID}"; }
trap clean_temp EXIT TERM INT

megahit -t ${SLURM_CPUS_PER_TASK} --memory 0.85 \
  --tmp-dir ${TMPDIR} \
  -1 FD28362002_corrected.fastq.1.gz \
  -2 FD28362002_corrected.fastq.2.gz \
  -r FD28362002_corrected.fastq.3.gz \
  -o FD28362002_corrected \
  2> FD28362002_corrected.megahit.contigs.fasta.log
```
</div>

!!! note-sticky "Cleanup on hard termination"
    The `trap` covers normal exit, cancellation via `SIGTERM`, and interrupt.
    It cannot cover `SIGKILL`, which is not trappable, nor a node failure.
    Where the cluster epilog already removes `/tmp/slurm-${SLURM_JOB_ID}` after
    a job ends, that provides a further safeguard against residue on hard
    termination.
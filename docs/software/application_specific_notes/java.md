# Java on the Cluster

Java-based tools are common in bioinformatics — Picard, GATK, Trimmomatic, and FastQC all
run on the Java Virtual Machine (JVM). Getting the most out of them on the cluster requires
a little extra configuration that isn't needed on a laptop.

---

## Why Java needs special attention on HPC

By default, the JVM estimates how much memory it can use based on the total RAM it can
*see* — which on a shared cluster node can be the entire machine's physical memory, not
just your job's allocation. This mismatch is the most common cause of two problems:

!!! quote ""

    - **Java heap space errors** — the JVM tries to use more memory than your job was
      allocated, causing it to be killed by SLURM.
    - **Out of memory (OOM) kills** — your job is terminated by the kernel or scheduler
      before Java even raises an error.

The fix is to tell Java explicitly how much memory it may use.

---

## Setting the maximum heap size (`-Xmx`)

The `-Xmx` flag sets the maximum heap memory the JVM is allowed to allocate. You should
**always** set this when running Java tools.

!!! lightbulb "The 75% rule"
    Set `-Xmx` to roughly **75% of your `--mem` request**. This leaves headroom for the
    JVM's own overhead (the stack, internal buffers, garbage collector, etc.) and avoids
    OOM kills.

    <center>

    | `--mem` (SLURM) | Recommended `-Xmx` |
    |---|---|
    | 8G  | `-Xmx6g`  |
    | 16G | `-Xmx12g` |
    | 32G | `-Xmx24g` |
    | 64G | `-Xmx48g` |
    </center>

### Direct invocation

If you are calling `java` directly:

<div class="nord" markdown>
```py
java -Xmx24g -jar /path/to/tool.jar [tool options]
```
</div>

### Picard

Picard is typically invoked via `java -jar`. Always pass `-Xmx` before `-jar`:

<div class="nord" markdown=1>
```py
# Mark duplicates with 24 GB heap (job requests --mem=32G)
java -Xmx24g -jar $EBROOTPICARD/picard.jar MarkDuplicates \
    --INPUT input.bam \
    --OUTPUT marked.bam \
    --METRICS_FILE metrics.txt
```
</div>


---

## Temporary files and `$TMPDIR`

Java tools often write large temporary files during processing (e.g. Picard's
intermediate sort files). By default Java writes these to `/tmp`, which is small and
shared across all users on the node.

You should redirect temporary files to `$TMPDIR` — ideally, set this to a path in `scratch` 

### Direct invocation

Pass `-Djava.io.tmpdir=$TMPDIR` alongside your other Java options:

<div class="nord" markdown=1>
```py
export TMPDIR=/some/path/to/scratch

java -Xmx24g -Djava.io.tmpdir=$TMPDIR -jar $EBROOTPICARD/picard.jar SortSam \
    --INPUT unsorted.bam \
    --OUTPUT sorted.bam \
    --SORT_ORDER coordinate \
    --TMP_DIR $TMPDIR  # (1)
```
</div>

1. Some Picard tools also accept a `--TMP_DIR` argument — passing both is redundant but
   harmless and makes intent explicit.

### Wrapped or pre-packaged tools

If the tool manages its own Java invocation (e.g. a shell wrapper script), you cannot
pass `-D` flags directly. Instead, export the `_JAVA_OPTIONS` environment variable
**before** calling the tool:

<div class="nord" makrdown=1>
```py
export _JAVA_OPTIONS="-Xmx24g -Djava.io.tmpdir=${TMPDIR}"
fastqc --threads 4 sample.fastq.gz  # (1)
```
</div>

1. FastQC calls Java internally. `_JAVA_OPTIONS` is picked up automatically by any
   JVM launched in the same shell session.

!!! square-pen "Note"
    `_JAVA_OPTIONS` applies to **every** JVM started in that shell session. If your
    script launches multiple Java tools with different memory requirements, set it
    separately before each call (or use direct `-Xmx` flags where possible).

---

## Complete SLURM job script

The following example puts everything together for a Picard MarkDuplicates job:

<div class="nord" markdown=1>
```rust
#!/bin/bash

#SBATCH --job-name=picard_markdup
#SBATCH --partition=short
#SBATCH --cpus-per-task=4
#SBATCH --mem=32G
#SBATCH --time=02:00:00
#SBATCH --output=logs/%x_%j.out

module load Picard/3.1.1-Java-17

# Set heap to 75% of --mem; redirect tmp to per-job scratch
JAVA_MEM=24g
export TMORDIR=/path/in/scratch

java -Xmx${JAVA_MEM} \
     -Djava.io.tmpdir=${TMPDIR} \
     -jar $EBROOTPICARD/picard.jar MarkDuplicates \
     --INPUT input.bam \
     --OUTPUT marked.bam \
     --METRICS_FILE metrics.txt \
     --TMP_DIR ${TMPDIR}
```
</div>

---

## Diagnosing Java memory errors

If your job fails, check the error log for these signatures:

| Error message | Likely cause | Fix |
|---|---|---|
| `java.lang.OutOfMemoryError: Java heap space` | `-Xmx` too low or not set | Increase `--mem` and `-Xmx` |
| `java.lang.OutOfMemoryError: GC overhead limit exceeded` | Heap too small; GC thrashing | Increase `-Xmx` |
| `Killed` (no Java error) | OOM kill by SLURM/kernel | Increase `--mem`; check `-Xmx` ≤ 75% |
| `No space left on device` in tmp path | `/tmp` full | Add `-Djava.io.tmpdir=${TMPDIR}` |


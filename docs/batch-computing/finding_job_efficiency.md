# Finding Job Efficiency


Requesting more resources than your job actually uses wastes allocation for everyone on the cluster. The `efficiency` tool (part of the `KIR-utils` module) gives you a quick, readable breakdown of how well a completed job used its requested CPUs and memory.

## The `efficiency` tool

<div class="nord" markdown=1>
```py
module load KIR-utils
efficiency <JOBID>
```
</div>

`efficiency` wraps `seff` with friendlier output 

!!! note-sticky "When can I run it?"
    `efficiency` only produces meaningful output once a job has **finished or failed** — it relies on accounting data that Slurm writes at job completion. Running it against a live job will return zeroes or incomplete figures.

---

## Understanding the output

The two metrics to focus on are:

| Metric | What it measures |
|--------|-----------------|
| **CPU efficiency** | CPU-seconds actually used ÷ (CPUs requested × wall-clock time) |
| **Memory efficiency** | Peak RSS ÷ memory requested |

A well-tuned job aims for CPU efficiency above **80%** and memory efficiency above **60%**. Values well below these suggest you over-requested resources — tighten your `#SBATCH` directives so the scheduler can pack jobs more effectively.

!!! lightbulb  "Hyperthreading and values above 100%"
    BMRC nodes expose **logical cores** (hardware threads) to Slurm, with two logical cores per physical core. This means the theoretical ceiling for **CPU efficiency** is around **200%**. Values between 100–200% are normal for well-parallelised jobs and indicate both hardware threads on a physical core are active. This is not a measurement error — it reflects genuine CPU pipeline utilisation above what the wall-clock alone would suggest.

---

## Worked examples

The two jobs below are designed to produce contrasting efficiency profiles. Submit them, let them finish, then run `efficiency <JOBID>` to see the difference.

### Example 1 — parallel CPU burn

This job uses Python's `multiprocessing.Pool` to spawn exactly `SLURM_CPUS_PER_TASK` workers, each doing CPU-bound prime counting. Every requested core stays busy for the full run.

??? file-code "parallel_cpu_burn.sl"

    <div class="nord" markdown=1>
    ```rust title="parallel_cpu_burn.sh"
    #!/bin/bash

    #SBATCH --job-name=parallel_cpu_burn
    #SBATCH --cpus-per-task=8
    #SBATCH --mem=2G
    #SBATCH --time=0:15:00
    #SBATCH --output=parallel_cpu_burn_%j.out


    cat > parallel_cpu.py <<'PYEOF'
    import os
    import math
    from multiprocessing import Pool

    def count_primes(limit):
        count = 0
        for n in range(2, limit):
            if all(n % i != 0 for i in range(2, int(math.sqrt(n)) + 1)):
                count += 1
        return count

    if __name__ == "__main__":
        ncpus = int(os.environ.get("SLURM_CPUS_PER_TASK", 1))
        print(f"Launching {ncpus} workers ...", flush=True)
        chunks = [700_000] * ncpus
        with Pool(processes=ncpus) as pool:
            results = pool.map(count_primes, chunks)
        print(f"Done. Primes found per worker: {results}")
        print(f"Total: {sum(results)}")
    PYEOF

    python3 parallel_cpu.py
    ```
    </div>

**Expected `efficiency` output:**

```
# add your efficiency output here
```

---

### Example 2 — serial job with high memory

This job requests **4 CPUs** but runs a single-threaded Python loop over a ~10 GB NumPy array. Only one core is ever active. This is a common pattern when researchers copy a multi-CPU template without thinking about whether their code is actually parallel.

??? file-code "serial_memory_job.sl"
    <div class="nord" markdown=1>
    ```rust title="serial_memory_job.sh"
    #!/bin/bash

    #SBATCH --job-name=serial_memory_job
    #SBATCH --cpus-per-task=4
    #SBATCH --mem=12G
    #SBATCH --time=0:10:00
    #SBATCH --output=serial_memory_job_%j.out

    # use numpy from a Python virtual env or 
    # load SciPy-bundle/2023.07-gfbf-2023a module  

    python3 - <<'EOF'
    import numpy as np
    
    print("Allocating ~10 GB array ...", flush=True)
    # float64 = 8 bytes; 1,250,000,000 × 8 = 10 GB
    arr = np.random.rand(1_250_000_000)
    
    print("Running serial reduction ...", flush=True)
    total = 0.0
    for start in range(0, len(arr), 10_000_000):
        total += arr[start : start + 10_000_000].sum()
    
    print(f"Sum: {total:.4f}")
    EOF
    ```
    </div>

!!! filter "Expected `efficiency` output"

    <div class="github-dark" markdown=1>
    ```rust
    $ efficiency 18817817

    Job Efficiency Report
    Cluster: cluster
    Job ID: 18817817
    User: username
    State: COMPLETED
    Cores: 2
    Tasks: 1
    Nodes: 1

    Job Wall-time:
      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   2.7% 00:00:16 of 00:10:00 time limit
    CPU Efficiency:
      ████████████░░░░░░░░░░░░░░░░░░  40.6% 00:00:13 of 00:00:32 core-walltime
    Memory Efficiency:
      ███████████████████████░░░░░░░  77.9% 9.35 GB of 12.0 GB

    Recommendations:
    • CPU efficiency is low. Consider reducing core count or optimizing code.
    ```
    </div>

    The CPU efficiency will show roughly **35-45%** (1 of 4 requested cores active). The fix is straightforward — change `--cpus-per-task=4` to `--cpus-per-task=1`. Memory efficiency should be high since the array genuinely needs ~10 GB.

---

## Fixing common inefficiencies

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Low CPU efficiency, single-threaded code | Over-requested CPUs | Set `--cpus-per-task=1` |
| Low CPU efficiency, multi-threaded code | Thread count not pinned to allocation | Set `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, etc. to `$SLURM_CPUS_PER_TASK` |
| Low memory efficiency | Conservative `--mem` estimate | Reduce `--mem`; use `efficiency` on a test run to calibrate |
| CPU efficiency > 100% | Hyperthreading in use | Expected — see note above |

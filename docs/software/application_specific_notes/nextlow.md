# Nextflow

Below is a ready-made Nextflow configuration profile for running pipelines (including
nf-core pipelines) on the BMRC Slurm cluster.

## Environment Variables 

By default, Nextflow will attempt to use your home directory for all operations, creating a hidden directory ~/.nextflow for this purpose. Since home directories are limited to 10GB, we recommend redirecting these operations to some path in group filesystem to avoid quota issues.

!!! key "Nextflow and Apptainer environment variables"

    - `NXF_HOME` (default $HOME/.nextflow) is the parent that holds pulled pipelines, plugins, and assets — redirecting it moves several sub-caches at once. `NXF_WORK` is the `work/` intermediate dir, which is by far the **largest** consumer (often tens to hundreds of GB per run).
    - Ideally, define these environment variables in your `~/.bashrc` which is much easier than adding them to individual Nextflow configurations

    <div class="dracula" markdown=1>
    ```py
    export NXF_HOME=""
    export NXF_WORK=""

    # Since majority of nf-core pipelines use Apptainer, 
    export NXF_APPTAINER_CACHEDIR=""
    export NXF_APPTAINER_LIBRARYDIR=""
    export APPTAINER_CACHEDIR=""
    export APPTAINER_TMPDIR=""

    # And Apptainer bind to expose the host filesystem
    export APPTAINER_BIND="/gpfs3/well,/gpfs3/users"

    # Other, not important but worth taking a look
    export NXF_TEMP=""   # Nextflow scratch; default is system temp
    export NXF_OPTS='-Xms1g -Xmx4g'                      # stops the head JVM ballooning
    ```    
    </div>

## The profile

Save the following as `kir_bmrc.config`:

<div class="dracula" markdown=1>
```groovy
//Profile config names for nf-core/configs
params {
    config_profile_description = 'Kennedy Institute of Rheumatology (KIR) profile for the BMRC cluster (Oxford)'
    config_profile_contact     = 'Dini Senanayake'
    config_profile_url         = 'https://kir-rescomp.github.io/kir-researchcomp-hub/software/application_specific_notes/nextlow/#the-profile'
}

process {
    executor = 'slurm'

    // Sane defaults — deliberately small so jobs schedule fast on a busy cluster.
    cpus   = 4
    memory = 8.GB
    time   = 4.h

    // Ceiling: no process may exceed the A-node max even if a label asks for more.
    resourceLimits = [
        cpus  : 48,
        memory: 729.GB,
        time  : 240.h
    ]

    // short (30 h, default) for anything that fits; long (10 d) otherwise.
    queue = { task.time <= 30.h ? 'short' : 'long' }

    // CPU accounts auto-map to usernames on BMRC — no --account needed.
    // memory directive emits Slurm --mem (whole-job), which is what we want.

    maxRetries    = 2
    errorStrategy = { task.exitStatus in [104,134,137,139,140,143,247] ? 'retry' : 'finish' }
}

executor {
    queueSize       = 100
    submitRateLimit = '10 sec'
}

singularity {
    enabled    = true
    autoMounts = true
    // No shared cache by design. Each user sets, in ~/.bashrc:
    //   export NXF_SINGULARITY_CACHEDIR=/well/<group>/users/$USER/singularity
}
```
</div>

### What the settings do

| Setting                           | Behaviour                                                    |
| --------------------------------- | ------------------------------------------------------------ |
| `executor = 'slurm'`              | Every process is submitted to the cluster via Slurm.         |
| `cpus`, `memory`, `time` defaults | Deliberately small (4 CPUs, 8 GB, 4 h) so jobs schedule quickly. Individual processes override these as needed. |
| `resourceLimits`                  | Caps any request at the A-node maximum (48 cores, 729 GB, 240 h) so an over-large request is clamped rather than left pending forever. |
| `queue` closure                   | Routes to `short` (30 h) by default, `long` (10 days) when a process asks for more than 30 h. |
| `memory` directive                | Emits Slurm `--mem` (whole-job shared memory), **not** `--mem-per-cpu`. |
| Account                           | CPU accounts are auto-mapped to usernames on BMRC, so no `--account` flag is required. |



### The test script

Save as `smoke.nf`:

<div class="dracula" markdown=1>
```groovy
process SMOKE {
    cpus 4
    memory 8.GB
    time 1.h

    script:
    """
    echo "host: \$(hostname)"
    echo "partition: \$SLURM_JOB_PARTITION"
    echo "cpus: \$SLURM_CPUS_ON_NODE  mem: \${SLURM_MEM_PER_NODE}M"
    sleep 20
    """
}

workflow {
    SMOKE()
}
```

The explicit `script:` label matters — without it, newer Nextflow versions can
mis-parse the process body and complete the workflow without dispatching any job.

### Layer 1 — config parses and resolves (offline, no jobs)

```py
nextflow -C /path/to/kir_bmrc.config config smoke.nf
```

This resolves and prints the merged config without submitting anything. Confirm
the output contains `process.executor = 'slurm'`, the `queue` closure,
`cpus = 4`, `memory = 8 GB`, and `singularity.enabled = true`. A syntax error in
the config fails here with the offending line number.

### Layer 2 — real job submits to Slurm and runs

```py
nextflow run smoke.nf -c /path/to/kir_bmrc.config
```

The run output should include an `executor >  slurm (1)` line and a `SMOKE`
process with a task hash. In a second terminal:

```py
squeue --me
```

The job should appear in the `short` partition. Once it finishes, confirm it
landed where expected:

```py
cat work/*/*/.command.log
```
</div>

Expected output includes `partition: short`, `cpus: 4`, and `mem: 8192M`. That
confirms the full chain: the config loads, the executor is Slurm, the defaults
apply, memory is requested whole-job via `--mem`, and the partition logic works.

# GPU Nodes Fast local scratch (`/flash`)

A number of GPU nodes have fast local NVMe drives for jobs that require a lot of I/O.
Unlike the shared GPFS/Lustre filesystem ( filesystem we use to host home, `/well/`)  which is optimised for large, sequential,
parallel throughput, this local storage lives *inside the compute node* and
excels at **random, small-block, high-IOPS access**: many small files, frequent
seeks, index/database access, and metadata-heavy workloads.

!!! circle-info "Where it lives"
    Local scratch is available at:

    - `/flash/scratch` — shared scratch, open to all jobs
    - project-specific folders under `/flash` on the node
    
    It is **node-local and ephemeral**: data written here is only visible on the
    node that wrote it, and is **not** available from the login nodes, other
    compute nodes, or after the job ends. Treat it as working space for a single
    job, and stage important results back to GPFS before the job finishes.

## Requesting a node with local scratch

Add the `--constraint "flash"` feature to your Slurm request. For a batch job:

<div class="nord" markdown="1">
```py
sbatch --account gpu_<X>.prj -p gpu_p100_16gb --gres gpu:1 --constraint "flash" <JOBSCRIPT>
```

For an interactive session:

```py
srun --account --gres gpu:1 --partition gpu_interactive --constraint "flash" --pty bash
```

You can confirm the node actually has the feature with:

```py
scontrol show node "$(hostname)" | grep -i ActiveFeatures
```
</div>

## 
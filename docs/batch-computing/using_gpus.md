# GPU Resources on BMRC

## Overview

The BMRC cluster provides GPU-accelerated compute nodes for machine learning, deep learning, and other GPU-intensive workloads. 
These nodes feature NVIDIA GPUs with varying specifications to suit different computational requirements.

Due to rapidly evolving hardware capabilities, our GPU nodes have considerable variation in CPU, RAM, and GPU configurations. 
This guide will help you understand the available resources and how to request them efficiently.

??? circle-info-2 "More information"
    This documentation covers the essentials of GPU types available on the cluster and how to select and request them. For an extensive guide on choosing the right GPU for your codebase, benchmarking, and GPU profiling, refer to our [GPU profiling training material](https://kir-rescomp.github.io/training-gpu-profiling/).

    <div>
    <a href="https://https://kir-rescomp.github.io/training-gpu-profiling/" class="kp-card kp-training" style="max-width: 480px; text-decoration: none;">
      <div class="kp-header">
        <div class="kp-num">🎓</div>
        <div class="kp-meta">
          <div class="kp-label">KIR Research Computing</div>
          <p class="kp-title">GPU Profiling →</p>
        </div>
      </div>
      <div class="kp-body">
        <ul class="kp-topics">
          <li>Choosing a GPU for your workfload</li>
          <li>Inspecting a live GPU job with srun <code>--overlap</code></li>
          <li>Instrumenting a Slurm batch script for GPU monitoring</li>
          <li>Advanced: profiling GPU code with Nsight Systems</li>
        </ul>
      </div>
    </a>
    </div>


---

## 🛎️ GPU Jobs Require a Separate Slurm Account

!!! cloud-bolt "Use `gpu_kir.prj` for GPU jobs **only**"
    All GPU jobs **==must==** specify the dedicated GPU Slurm account:
    <div class="nord" markdown=1>
    ```rust
    # In a batch script
    #SBATCH --account gpu_kir.prj

    # In an interactive session
    srun --account gpu_kir.prj ...
    ```
    </div>

    **==Do not use `gpu_kir.prj` for CPU-only jobs.==** GPU allocations are billed at a higher rate than CPU allocations — using the GPU account for CPU jobs will result 
    in our project being charged at the more expensive GPU rate unnecessarily.

---

## GPU Partitions

GPU resources are available through the following Slurm partitions:

### Partition Table

| Partition | GPUs | GPU Memory (GB) | Max Runtime (hrs) | Default CPUs | Default Memory (GB) |
|---|---|---|---|---|---|
| **Batch partitions** | | | | | |
| `gpu_p100_16gb` | 12 | 16 | 60 | 5 | 90 |
| `gpu_v100_16gb` | 4 | 16 | 60 | 11 | 60 |
| `gpu_v100_32gb` | 2 | 32 | 60 | 7 | 750 |
| `gpu_rtx8000_48gb` | 12 | 48 | 60 | 7 | 185 |
| `gpu_a100_40gb` | 16 | 40 | 60 | 7 | 90 |
| `gpu_a100_80gb` | 24 | 80 | 60 | 11 | 120 |
| `gpu_gh200_144gb` | 40 | 144 | TBD | 72 | TBD |
| **Interactive partition** | | | | | |
| `gpu_interactive` | 18 | 24 | 12 | 7 | 80 |

### Partition Selection

- Use `gpu_interactive` for interactive development, debugging, and testing (12-hour limit, 1 GPU per user)
- Use a batch partition for non-interactive workloads — prefer partitions with sufficient GPU memory for your job rather than requesting the largest available
- `gpu_gh200_144gb` is a high-capability partition; runtime limits are still to be confirmed
- `gpu_v100_32gb` has a very high default memory allocation (750 GB) — only request what your job actually needs

---

## Selecting Runtime and QOS

The maximum runtime for most GPU partitions is 60 hours. If you know your job will finish sooner, you can apply a **Quality of Service (QOS)** at submission. This gives your job a significant priority boost in the queue and applies an appropriate runtime cap.

The priority boost is greatest for jobs under 4 hours, followed by 24 hours — 60-hour jobs receive no boost.

### GPU QOS Table

| QOS Name | Runtime (hrs) | Notes |
|---|---|---|
| `gpu_bmrc_4hr` | 4 | Highest priority boost |
| `gpu_bmrc_24hr` | 24 | Moderate priority boost |

To apply a one of the above QOS at submission:

<div class="nord" markdown=1>
```py
sbatch --account gpu_kir.prj -p gpu_a100_80gb --qos gpu_bmrc_4hr --gres gpu:1 your_script.sh
```
</div>

---

## Resource Limits

!!! circle-info "GPU usage limits"
    GPUs are a limited resource under considerable demand. Limits are applied to ensure fair throughput across all projects and to allow for scheduled maintenance.

    - **Per-project GPU limit:** 24 GPUs in use simultaneously (across all partitions)
    - **Minimum per job:** at least 1 GPU must be requested (`--gres gpu:1`)
    - **Batch partitions:** 60-hour maximum runtime — this **cannot** be extended
    - **Interactive partition:** 1 GPU per user, 12-hour maximum runtime

Runtime limits cannot be extended for jobs in normal operation. If your workload exceeds 60 hours, consider:

- **Checkpointing** — save model/state periodically and resume from the last checkpoint
- **Parallelisation** — break work into smaller independent chunks that fit within shorter runtimes

Both approaches also improve resilience against unexpected job interruption.

---

## Available GPU Hardware

### GPU Models Overview

BMRC includes five generations of NVIDIA GPUs:

| GPU Model | Memory | Architecture | CUDA Compute | Best For |
|---|---|---|---|---|
| **A100** (80 GB) | 80 GB | Ampere | 8.0 | Large models, highest performance |
| **A100** (40 GB) | 40 GB | Ampere | 8.0 | Modern ML/DL workloads |
| **Quadro RTX 8000** | 48 GB | Turing | 7.5 | Memory-intensive workloads |
| **Quadro RTX 6000** | 24 GB | Turing | 7.5 | General ML/DL tasks |
| **V100** | 16–32 GB | Volta | 7.0 | Older generation, still compatible |
| **P100** | 16 GB | Pascal | 6.0 | ⚠️ Not compatible with PyTorch 2.0+ |

### GPU Distribution by Node

```bash
# View GPUs in a partition
sinfo -p gpu_interactive -o "%N %G" -N
```

| GPU Type | GPU Memory | Nodes | GPUs/Node | Total GPUs |
|---|---|---|---|---|
| p100-sxm2-16gb | 16 GB | compg009, compg010, compg011, compg013 | 4 | 16 |
| v100-pcie-32gb | 32 GB | compg016 | 2 | 2 |
| v100-sxm2-16gb | 16 GB | compg027 | 4 | 4 |
| quadro-rtx8000 | 48 GB | compg028, compg029, compg030 | 4 | 12 |
| a100-pcie-40gb | 40 GB | compg031, compg032 | 4 | 8 |
| a100-pcie-80gb | 80 GB | compg035, compg036, compg039–042 | 4 | 24 |

### Detailed Node Specifications

??? note "Click to expand full node specifications"

    | Node | GPU Type | GPUs | GPU RAM/card | CPU cores/slot | RAM/slot | CPU Arch |
    |---|---|---|---|---|---|---|
    | compg009 | p100-sxm2-16gb | 4 | 16 GB | 6 | 91 GB | Skylake |
    | compg010 | p100-sxm2-16gb | 4 | 16 GB | 6 | 91 GB | Skylake |
    | compg011 | p100-sxm2-16gb | 4 | 16 GB | 6 | 91 GB | Skylake |
    | compg013 | p100-sxm2-16gb | 4 | 16 GB | 6 | 91 GB | Skylake |
    | compg016 | v100-pcie-32gb | 2 | 32 GB | 6 | 750 GB | Skylake |
    | compg019 | quadro-rtx6000 | 4 | 24 GB | 10 | 91 GB | Skylake |
    | compg027 | v100-sxm2-16gb | 4 | 16 GB | 12 | 60 GB | Skylake |
    | compg028 | quadro-rtx8000 | 4 | 48 GB | 8 | 187 GB | Skylake |
    | compg029 | quadro-rtx8000 | 4 | 48 GB | 8 | 187 GB | Skylake |
    | compg030 | quadro-rtx8000 | 4 | 48 GB | 8 | 187 GB | Skylake |
    | compg031 | a100-pcie-40gb | 4 | 40 GB | 8 | 91 GB | Skylake |
    | compg032 | a100-pcie-40gb | 4 | 40 GB | 8 | 91 GB | Skylake |
    | compg033 | a100-pcie-40gb | 4 | 40 GB | 8 | 91 GB | Skylake |
    | compg035 | a100-pcie-80gb | 4 | 80 GB | 8 | 91 GB | Skylake |
    | compg036 | a100-pcie-80gb | 4 | 80 GB | 8 | 91 GB | Skylake |
    | compg039 | a100-pcie-80gb | 4 | 80 GB | 12 | 128 GB | Skylake |
    | compg040 | a100-pcie-80gb | 4 | 80 GB | 12 | 128 GB | Skylake |
    | compg041 | a100-pcie-80gb | 4 | 80 GB | 12 | 128 GB | Skylake |
    | compg042 | a100-pcie-80gb | 4 | 80 GB | 12 | 128 GB | Skylake |

---

## ⚠️ P100 GPU Compatibility Warning

!!! danger "P100 GPUs are not compatible with PyTorch 2.0+ or modern ML frameworks"
    P100 GPUs have CUDA Compute Capability 6.0. PyTorch 2.0+, TensorFlow 2.12+, JAX, and similar frameworks require Compute Capability 7.0 or higher. Jobs will **fail with cryptic CUDA errors** if inadvertently scheduled on P100 nodes.

    **Always exclude P100s for modern ML/DL workloads** (see below).

### How to Exclude P100 GPUs

**Method 1: Use constraints (recommended)**

```bash
sbatch --account gpu_kir.prj -p gpu_interactive --gpus-per-node 1 \
    --constraint "v100|rtx6000|rtx8000|a100" your_script.sh
```

**Method 2: Request a specific GPU type**

```bash
# Request A100 80 GB
sbatch --account gpu_kir.prj -p gpu_interactive --gres gpu:a100-pcie-80gb:1 your_script.sh

# Request RTX 8000
sbatch --account gpu_kir.prj -p gpu_interactive --gres gpu:quadro-rtx8000:1 your_script.sh
```

### Recommended GPUs for ML/DL Workloads

| Priority | GPU Model | Memory | Use Case |
|---|---|---|---|
| 🥇 Best | A100 (80 GB) | 80 GB | Large language models, massive datasets |
| 🥇 Best | A100 (40 GB) | 40 GB | General ML/DL, best performance |
| 🥈 Good | Quadro RTX 8000 | 48 GB | Large models, memory-intensive workloads |
| 🥈 Good | Quadro RTX 6000 | 24 GB | Standard ML/DL workloads |
| 🥉 Compatible | V100 | 16–32 GB | Older generation, still works |
| ❌ Avoid | P100 | 16 GB | Will not work with PyTorch 2.0+ |

---

## Submitting GPU Jobs

### Basic GPU Request

The recommended methods for requesting GPUs are `--gres` or `--gpus-per-node`:

**Using `--gres` (Generic Resource Scheduling):**

```bash
sbatch --account gpu_kir.prj -p gpu_a100_40gb --gres gpu:1 your_script.sh
```

**Using `--gpus-per-node`:**

```bash
sbatch --account gpu_kir.prj -p gpu_a100_40gb --gpus-per-node 1 your_script.sh
```

Where `N` is the number of GPUs required per node (maximum of 4 on most nodes).

### Requesting Specific GPU Types

Specific GPU types are primarily useful when submitting to `gpu_interactive`, which is the only partition containing multiple GPU models. For all other partitions, the GPU type is fixed by the partition name.

```bash
# Request a specific GPU type on gpu_interactive
sbatch --account gpu_kir.prj -p gpu_interactive --gres gpu:a100-pcie-80gb:1 your_script.sh
```

### Using GPU Constraints (Recommended for `gpu_interactive`)

Constraints let you specify acceptable GPU classes, giving the scheduler flexibility while ensuring your requirements are met:

```bash
sbatch --account gpu_kir.prj -p gpu_interactive --gpus-per-node 1 \
    --constraint "a100|rtx8000" your_script.sh
```

**Available constraint features:**

| Constraint | GPU | Memory |
|---|---|---|
| `p100` | P100 | 16 GB |
| `v100` | V100 | 16–32 GB |
| `rtx6000` | Quadro RTX 6000 | 24 GB |
| `rtx8000` | Quadro RTX 8000 | 48 GB |
| `a100` | A100 | 40 GB or 80 GB |

---

## Interactive GPU Sessions

For development, debugging, and testing:

```bash
srun --account gpu_kir.prj -p gpu_interactive --gres gpu:1 --pty bash
```

- Time limit: 12 hours
- Maximum: 1 GPU per user

You can also open interactive sessions on batch partitions if you need access to a specific GPU type:

```bash
srun --account gpu_kir.prj -p gpu_a100_40gb --gres gpu:a100-pcie-40gb:1 --pty bash
```

---

## Example Job Scripts

### Basic PyTorch Training Job

```bash
#!/bin/bash

#SBATCH --account        gpu_kir.prj
#SBATCH --partition      gpu_a100_80gb
#SBATCH --qos            gpu_bmrc_4hr
#SBATCH --gpus-per-node  1
#SBATCH --mem            64G
#SBATCH --cpus-per-task  8
#SBATCH --job-name       my_training_job
#SBATCH --output         logs/%j.out

module load Python/3.11.3-GCCcore-12.3.0
source ~/venvs/pytorch/bin/activate

python train_model.py --epochs 50 --batch-size 32
```

### Multi-GPU Training Job

```bash
#!/bin/bash

#SBATCH --account        gpu_kir.prj
#SBATCH --partition      gpu_a100_40gb
#SBATCH --gres           gpu:4
#SBATCH --mem            200G
#SBATCH --cpus-per-task  32
#SBATCH --job-name       multi_gpu_training

module load Python/3.11.3-GCCcore-12.3.0
source ~/venvs/pytorch/bin/activate

torchrun --nproc_per_node=4 train_distributed.py
```

### Memory-Intensive Job

```bash
#!/bin/bash

#SBATCH --account        gpu_kir.prj
#SBATCH --partition      gpu_rtx8000_48gb
#SBATCH --gpus-per-node  2
#SBATCH --mem-per-gpu    150G
#SBATCH --cpus-per-task  16
#SBATCH --job-name       memory_intensive

module load Python/3.11.3-GCCcore-12.3.0
source ~/venvs/tensorflow/bin/activate

python train_large_model.py
```

---

## Resource Allocation

### CPU Cores

Each GPU slot comes with a default number of CPU cores (see partition table above). To override:

```bash
# Specify CPUs per GPU
sbatch --account gpu_kir.prj -p gpu_a100_40gb --gres gpu:2 --cpus-per-gpu 4 your_script.sh

# Or specify total CPUs for the job
sbatch --account gpu_kir.prj -p gpu_a100_40gb --gres gpu:2 -c 16 your_script.sh
```

### System Memory (RAM)

Total RAM available scales with the number of GPUs requested: `RAM per slot × number of GPUs`.

```bash
# Specify RAM per GPU
sbatch --account gpu_kir.prj -p gpu_a100_40gb --gres gpu:2 --mem-per-gpu 80G your_script.sh

# Or specify total RAM for the job
sbatch --account gpu_kir.prj -p gpu_a100_40gb --gres gpu:2 --mem 160G your_script.sh
```

!!! info
    You can request up to the RAM-per-slot limit shown in the detailed node specifications. For example, compg028 has 187 GB per slot, so requesting 4 GPUs on that node could give you up to 748 GB total RAM.

---

## Best Practices

1. **Choose the right partition** — use `gpu_interactive` for development and testing; use a batch partition for production workloads
2. **Apply a QOS** — if your job will finish in under 4 or 24 hours, use `--qos gpu_bmrc_4hr` or `--qos gpu_bmrc_24hr` to improve queue priority
3. **Request appropriate resources** — don't over-request GPUs, CPUs, or RAM; test with 1 GPU before scaling up
4. **Exclude P100s for modern ML/DL** — always add `--constraint "v100|rtx6000|rtx8000|a100"` for PyTorch 2.0+ / TensorFlow 2.12+ jobs
5. **Monitor your jobs** — use `nvidia-smi` in interactive sessions; review efficiency after completion with `seff <job_id>`
6. **Plan for heterogeneity** — different nodes have different CPU/RAM allocations; check the node specs table if you need specific resources

---

## Quick Reference

### Common Commands

```bash
# View available GPUs in a partition
sinfo -p gpu_a100_80gb -o "%N %G" -N

# Check GPU queue status
squeue -p gpu_a100_80gb

# Submit a GPU job with a 4-hour QOS
sbatch --account gpu_kir.prj -p gpu_a100_80gb --qos gpu_bmrc_4hr --gres gpu:1 script.sh

# Interactive session
srun --account gpu_kir.prj -p gpu_interactive --gres gpu:1 --pty bash

# Check GPU usage (when on a GPU node)
nvidia-smi
```

### GPU GRES Quick Reference

```bash
# P100 (⚠️ avoid for PyTorch 2.0+)
--gres gpu:p100-sxm2-16gb:N

# V100
--gres gpu:v100-pcie-32gb:N
--gres gpu:v100-sxm2-16gb:N

# RTX
--gres gpu:quadro-rtx6000:N
--gres gpu:quadro-rtx8000:N

# A100
--gres gpu:a100-pcie-40gb:N
--gres gpu:a100-pcie-80gb:N
```

---

## Advanced Options

!!! warning "Contact KIR Research Computing before using these options"
    The flags `--gpus`, `--gpus-per-task`, and `--gpus-per-socket` are relevant for MPI workloads and can create blocking reservations that affect other users. **Please contact KIR Research Computing Manager before using these options.**

---

## Getting Help

- Check job output files for error messages
- Use `scontrol show job <job_id>` to inspect job details
- Contact KIR Research Computing at <kir-rc@kennedy.ox.ac.uk>
- For MPI or advanced GPU scheduling, contact us first to discuss your requirements

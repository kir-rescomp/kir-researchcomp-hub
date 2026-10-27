---
title: What is HPC 
description: A short visual introduction to HPC clusters and login nodes for researchers new to the BMRC cluster.
---

# What is HPC ? :  Before Your First Login

If you have not used a High-Performance Computing (HPC) cluster before, this page provides the mental picture you will need before connecting to the BMRC cluster for the first time. It takes around five minutes to read. The detailed, task-specific guidance is covered elsewhere in this Hub; the aim here is only to make that guidance easier to follow.

---

## 1. What is an HPC cluster?

An HPC cluster is a large number of powerful computers, called **nodes**, connected by a high-speed network and sharing the same storage. Researchers use it to run analyses that would be too slow, too large, or too numerous for a laptop or desktop.

<p align="center">
    <img src="{{ config.site_url }}assets/images/technical_essays/what-is-hpc.svg" alt="compiler-toolchains-logo" width="650"/>
</p>


Three points are worth retaining from this picture:

1. **A cluster is many computers, not one very large one.** Your work runs on one or more of these nodes, which is why you request a specific number of cores and amount of memory for each job.
2. **Every node sees the same files.** A file saved from one node is immediately available on every other node, so you do not copy data between them.
3. **The cluster is shared.** Many research groups use it simultaneously, so work is queued and allocated fairly rather than started the moment you type a command.

??? info "Key terms you will meet throughout the documentation"

    | Term | Meaning |
    |------|---------|
    | **Node** | One computer within the cluster. |
    | **Core (CPU)** | One processing unit within a node. A node has many cores. |
    | **Memory (RAM)** | Working space for a running program, separate from disk storage. |
    | **GPU** | A specialised processor that accelerates certain workloads, such as deep learning and some image analysis. |
    | **Job** | A piece of work you ask the cluster to run, together with the resources it needs. |
    | **Scheduler (Slurm)** | The system that queues jobs and decides where and when each one runs. |

---

## 2. What is a login node?

When you connect to the BMRC cluster, you do not arrive on the compute nodes. You arrive on one of four **login nodes**, `cluster1` to `cluster4`. A login node is the entry point to the cluster: the place where you prepare your work and hand it to the scheduler, which then runs it on the compute nodes.

<p align="center">
    <img src="{{ config.site_url }}assets/images/technical_essays/login-nodes.svg" alt="compiler-toolchains-logo" width="650"/>
</p>


Every user of the cluster is connected to the same small number of login nodes at the same time. A single heavy analysis running on a login node slows the system for everyone, and BMRC may terminate such processes without notice.

<div class="grid cards" markdown>

-   :material-check-circle:{ .lg .middle } **Appropriate on a login node**

    ---

    - Navigating, organising and editing files
    - Transferring data to and from the cluster
    - Loading software modules and writing scripts
    - Submitting and monitoring jobs
    - Short checks that finish within seconds

-   :material-close-circle:{ .lg .middle } **Submit to the compute nodes instead**

    ---

    - Running analyses, pipelines or R/Python sessions with real data
    - Anything that uses several cores or a large amount of memory
    - Anything expected to take more than a few minutes
    - Interactive work: request an interactive session on a compute node with `srun`

</div>

!!! tip "How to tell where you are"

    Your terminal prompt shows the name of the machine you are working on. `[user@cluster1 ~]$` means you are on a login node; once a job or interactive session starts on a compute node, the prompt shows that node's name instead, for example `[user@compe028 ~]$`.

!!! note "Internet access"

    The login nodes can reach the internet directly. The compute nodes cannot, so download any data, containers or packages from a login node before submitting the job that needs them.

---

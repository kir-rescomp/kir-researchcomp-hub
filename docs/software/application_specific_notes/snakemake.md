# Snakemake 


We recommend installing Snakemake directly into your Python environment rather than using the
pre-built `Snakemake` modules available on the cluster. Loading a module alongside your own
virtual environment can cause conflicts between Snakemake's dependencies and your project's
packages.

### Installation

Install Snakemake and the required BMRC executor plugins into your environment using `pip` or
`uv`:

<div class="nord" markdown=1>
```py
uv pip install \
  "snakemake>=9.16" \
  snakemake-executor-plugin-drmaa \
  snakemake-executor-plugin-slurm \
  snakemake-executor-plugin-slurm-jobstep
```
</div>

!!! warning "Use Snakemake ≥ 9.16"
    We recommend **Snakemake 9** for all new workflows. If you are using Snakemake 9, please
    ensure you install version **9.16 or later** — earlier 9.x releases contain a bug that
    affects job submission on BMRC.

!!! lightbulb "Which executor plugin should I use?"
    - **`drmaa`** — recommended for most workflows; integrates tightly with SLURM via the DRMAA
      interface and provides robust job tracking.
    - **`slurm`** — a lighter alternative if DRMAA is not available in your environment.
    - **`slurm-jobstep`** — required when running grouped jobs or cluster steps inside an
      existing SLURM allocation.

For a full walkthrough of configuring and running Snakemake workflows on BMRC — including
profiles, resource specification, and monitoring —  click below, 

<div>
<a href="https://kir-rescomp.github.io/training-intro-to-snakemake/" class="kp-card kp-training" style="max-width: 480px; text-decoration: none;">
  <div class="kp-header">
    <div class="kp-num">🎓</div>
    <div class="kp-meta">
      <div class="kp-label">KIR Research Computing</div>
      <p class="kp-title">Introduction to Snakemake →</p>
    </div>
  </div>
  <div class="kp-body">
    <ul class="kp-topics">
      <li>Migrating from Shell scripts to Snakemake</li>
      <li>First Snakefile</li>
      <li>Scaling to the cluster</li>
      <li>Best Practicess</li>
    </ul>
  </div>
</a>
</div>
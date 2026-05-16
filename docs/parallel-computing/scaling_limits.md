# Scaling Limits

## Amdahl's law and Gustafson's law

When you submit a job to a cluster with more CPU cores, you might reasonably expect twice the cores to give twice the speed. In practice, the relationship is more complicated — and two laws describe exactly why.

---

### The core problem: serial bottlenecks

Any parallel workload has two components:

- **Serial work** — steps that must happen in sequence (reading input, writing output, checkpointing, initialising data structures). Only one processor can do this at a time.
- **Parallel work** — steps that can be split across many processors simultaneously (computing, transforming, simulating).

Adding more processors only accelerates the parallel portion. The serial portion is immune to parallelism, and as you scale up, it increasingly dominates total runtime.

---

### Amdahl's law (1967)

**Amdahl's law** gives the theoretical maximum speedup for a fixed-size problem:

$$S = \frac{1}{s + \dfrac{1 - s}{p}}$$

where $s$ is the serial fraction of the workload and $p$ is the number of processors.

The critical insight is that as $p \to \infty$, speedup approaches $\tfrac{1}{s}$ — a hard ceiling. A workload that is 10% serial can *never* exceed **10× speedup**, no matter how many processors you throw at it.

| Serial fraction | Maximum possible speedup |
|----------------|--------------------------|
| 50%            | 2×                       |
| 25%            | 4×                       |
| 10%            | 10×                      |
| 5%             | 20×                      |
| 1%             | 100×                     |

!!! warning "Amdahl's pessimism"
    A workload that feels "mostly parallel" can still have a brutal ceiling. 10% serial code caps you at 10× regardless of whether you use 16, 256, or 10,000 cores.

---

### Gustafson's law (1988)

**Gustafson's law** challenges Amdahl's framing. The speedup formula looks similar:

$$S = p - s(p - 1)$$

but the underlying assumption is fundamentally different. Gustafson observed that in practice, researchers don't run the *same* fixed job faster — they use extra processors to tackle *larger problems* in the same wall-clock time.

- Amdahl: fixed problem, fewer serial seconds per run → serial becomes the bottleneck.
- Gustafson: fixed *time*, larger problem → serial fraction stays small as the parallel portion grows.

The result is a much more optimistic scaling curve. There is no hard ceiling — speedup scales roughly linearly with $p$ when $s$ is small.

!!! lightbulb "When Gustafson applies"
    Gustafson's framing fits most real HPC workloads well: running a finer-resolution simulation, processing more samples in a cohort, using a larger training dataset. The question isn't "how fast can I finish this specific job?" but "how much science can I do in a given allocation window?"

---

## Interactive explorer

Adjust the sliders to see how both laws respond to changes in the serial fraction and processor count.

<div class="pl-widget">

  <div class="pl-formula-bar">
    <span class="pl-formula-pill pl-formula-amdahl">Amdahl: S = 1 / (s + (1−s)/p)</span>
    <span class="pl-formula-pill pl-formula-gustafson">Gustafson: S = p − s(p−1)</span>
  </div>

  <div class="pl-controls">
    <div class="pl-control-row">
      <div class="pl-control-label">
        <span>Serial fraction (s)</span>
        <span class="pl-control-val" id="pl-serial-out">0.10</span>
      </div>
      <input type="range" id="pl-serial-slider" min="0" max="0.95" step="0.01" value="0.10">
    </div>
    <div class="pl-control-row">
      <div class="pl-control-label">
        <span>Max processors (p)</span>
        <span class="pl-control-val" id="pl-proc-out">64</span>
      </div>
      <input type="range" id="pl-proc-slider" min="2" max="128" step="2" value="64">
    </div>
  </div>

  <div class="pl-stat-cards">
    <div class="pl-stat-card">
      <div class="pl-stat-label">Amdahl ceiling</div>
      <div class="pl-stat-value pl-amdahl-color" id="pl-amdahl-limit">10.0×</div>
    </div>
    <div class="pl-stat-card">
      <div class="pl-stat-label">Amdahl at p</div>
      <div class="pl-stat-value pl-amdahl-color" id="pl-amdahl-at-p">—</div>
    </div>
    <div class="pl-stat-card">
      <div class="pl-stat-label">Gustafson at p</div>
      <div class="pl-stat-value pl-gustafson-color" id="pl-gustafson-at-p">—</div>
    </div>
    <div class="pl-stat-card">
      <div class="pl-stat-label">Difference at p</div>
      <div class="pl-stat-value" id="pl-diff">—</div>
    </div>
  </div>

  <div class="pl-legend">
    <span><span class="pl-legend-line" style="background:#534AB7;"></span> Amdahl's law</span>
    <span><span class="pl-legend-line" style="background:#1D9E75;"></span> Gustafson's law</span>
    <span><span class="pl-legend-dashed"></span> Amdahl ceiling</span>
  </div>

  <div class="pl-chart-wrap" style="height:300px;">
    <canvas id="pl-main-chart"
            role="img"
            aria-label="Line chart comparing speedup curves for Amdahl's Law and Gustafson's Law across processor counts">
      Speedup curves for Amdahl's Law and Gustafson's Law.
    </canvas>
  </div>

  <div class="pl-section-label">Serial fraction sensitivity (at selected p)</div>

  <div class="pl-chart-wrap" style="height:210px;">
    <canvas id="pl-sensitivity-chart"
            role="img"
            aria-label="Line chart showing how speedup changes as the serial fraction increases from 0 to 0.95">
      Speedup vs. serial fraction for Amdahl's Law and Gustafson's Law.
    </canvas>
  </div>

</div>

---

## Practical implications on the cluster

### Choosing your core count

Amdahl's law is most relevant when your job has a hard serial phase you cannot avoid — for example, a pipeline step that reads and indexes a large file before the parallel processing begins. In these cases, requesting hundreds of cores will not help if that indexing step takes 30 minutes regardless.

Profile first. Tools like [Slurm's job efficiency reports](../batch-computing/finding_job_efficiency.md) and `sacct` can tell you whether your jobs are actually using the cores they request.

### Scaling out vs. scaling up

| Scenario | Better fit |
|----------|-----------|
| Fixed dataset, want it faster | Amdahl — check the serial ceiling before requesting more cores |
| Larger dataset, same time budget | Gustafson — more cores let you do more work |
| Embarrassingly parallel (e.g. per-sample pipelines) | Gustafson — near-linear scaling, use job arrays |
| Tightly coupled simulation (e.g. MPI across nodes) | Amdahl — communication overhead adds to the effective serial fraction |

### The hidden serial fraction

In MPI jobs, communication and synchronisation overhead act as an *additional* serial penalty on top of whatever is inherently sequential in your code. This is why strong scaling (same problem, more cores) typically plateaus well before Amdahl's theoretical ceiling — the effective $s$ is higher than the code alone suggests.

!!! square-pen "Rule of thumb"
    For most bioinformatics pipelines on BMRC, requesting more than 16–32 cores per step rarely helps unless you have profiled the job and confirmed the parallel fraction justifies it. Over-requesting cores wastes allocation and increases queue wait time.

---

## Summary

| | Amdahl's law | Gustafson's law |
|--|--|--|
| Problem size | Fixed | Scales with processors |
| Serial portion | Hard speedup ceiling | Remains a small fraction |
| Scaling outlook | Pessimistic | Optimistic |
| Best applies to | Latency-sensitive, fixed jobs | Throughput-oriented, scalable workloads |
| Formula | $S = \frac{1}{s + (1-s)/p}$ | $S = p - s(p-1)$ |

Both laws are correct within their assumptions. The key is recognising which regime your workload lives in before deciding how many cores to request.

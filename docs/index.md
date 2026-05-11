---
hide:
  - navigation
  - toc
title: Home
---

<div class="admonition spinner" style="text-align: center;">
  <p class="admonition-title">
    <span style="display: inline-block; animation: pulse 2s ease-in-out infinite;">🚧</span>
    Work in Progress
  </p>
  <p>This repository is under active development.<br>Expected completion: <strong>TBD</strong></p>
</div>

<style>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>

<h1></h1>
<p align="center" style="margin-bottom: -50px;">
    <img src="assets/images/icons/KIR_Research_Computing_Hub_layered_logo.svg" alt="kir-oxford-logo" width="400" style="opacity: 0.9;"/>
</p>

<div class="landing-page">
  <div class="hero">
    <p class="description">
      Docs, tools, and technical resources for research computing at the Kennedy Institute of Rheumatology, University of Oxford
    </p>
  </div>
</div>

<div class="section-title" markdown>
## :material-server-network: HPC Support Documentation
</div>

<div class="kp-episode-grid">

  <a href="https://kir-rescomp.github.io/kir-researchcomp-hub/getting-started/account" class="kp-card kp-ep1">
    <div class="kp-header">
      <div class="kp-num">01</div>
      <div class="kp-meta">
        <div class="kp-label">Getting Started</div>
        <p class="kp-title">Setup an account &amp; Login</p>
      </div>
    </div>
    <div class="kp-body">
      <ul class="kp-topics">
        <li>How to request a BMRC HPC account</li>
        <li>Access the cluster for the first time</li>
        <li>Set up your <code>ssh</code> clients</li>
      </ul>
    </div>
    <div class="kp-footer">
      <div class="kp-footer-label"></div>
      <div class="kp-footer-val"></div>
    </div>
  </a>

  <a href="https://kir-rescomp.github.io/kir-researchcomp-hub/file-system" class="kp-card kp-ep2">
    <div class="kp-header">
      <div class="kp-num">02</div>
      <div class="kp-meta">
        <div class="kp-label">Filesystem Layout</div>
        <p class="kp-title">Overview of BMRC Filesystem</p>
      </div>
    </div>
    <div class="kp-body">
      <ul class="kp-topics">
        <li>Where to store your raw data</li>
        <li>Where to do your work</li>
        <li>How to share data between the group or non-KIR BMRC groups</li>
      </ul>
    </div>
    <div class="kp-footer">
      <div class="kp-footer-label"></div>
      <div class="kp-footer-val"></div>
    </div>
  </a>

  <a href="https://kir-rescomp.github.io/kir-researchcomp-hub/software/software_manage_with_modules/" class="kp-card kp-ep3">
    <div class="kp-header">
      <div class="kp-num">03</div>
      <div class="kp-meta">
        <div class="kp-label">Software</div>
        <p class="kp-title">Managing Software on BMRC</p>
      </div>
    </div>
    <div class="kp-body">
      <ul class="kp-topics">
        <li>Search and access software with modules</li>
        <li>Notes on specific software</li>
        <li>How to create your own Python virtual environment</li>
        <li><code>pixi</code> in favour of </code>conda</code></li>
      </ul>
    </div>
    <div class="kp-footer">
      <div class="kp-footer-label"></div>
      <div class="kp-footer-val"></div>
    </div>
  </a>

  <a href="https://kir-rescomp.github.io/kir-researchcomp-hub/batch-computing/working_with_scheduler/" class="kp-card kp-ep4">
    <div class="kp-header">
      <div class="kp-num">04</div>
      <div class="kp-meta">
        <div class="kp-label">Batch Computing</div>
        <p class="kp-title">Introduction to Slurm</p>
      </div>
    </div>
    <div class="kp-body">
      <ul class="kp-topics">
        <li>What is Slurm and Slurm variables</li>
        <li>Using GPUs via Slurm</li>
        <li>Slurm job arrays</li>
      </ul>
    </div>
    <div class="kp-footer">
      <div class="kp-footer-label"></div>
      <div class="kp-footer-val"></div>
    </div>
  </a>

  <a href="https://kir-rescomp.github.io/kir-researchcomp-hub/interactive-computing/openondemand/" class="kp-card kp-ep5">
    <div class="kp-header">
      <div class="kp-num">05</div>
      <div class="kp-meta">
        <div class="kp-label">Interactive Computing</div>
        <p class="kp-title">Interactive HPC with OnDemand and <code>srun</code></p>
      </div>
    </div>
    <div class="kp-body">
      <ul class="kp-topics">
        <li>Introduction to OnDemand and it's apps</li>
        <li>Interactive computing with <code>srun</code></li>
      </ul>
    </div>
    <div class="kp-footer">
      <div class="kp-footer-label"></div>
      <div class="kp-footer-val"></div>
    </div>
  </a>

  <a href="https://kir-rescomp.github.io/kir-researchcomp-hub/data-transfer/cli_transfer" class="kp-card kp-ep6">
    <div class="kp-header">
      <div class="kp-num">06</div>
      <div class="kp-meta">
        <div class="kp-label">Data Transfer</div>
        <p class="kp-title">How to transfer data to/from BMRC filesystem</p>
      </div>
    </div>
    <div class="kp-body">
      <ul class="kp-topics">
        <li>Data transfer with CLI tools such as scp,rsync</li>
        <li>How to use FileZilla</li>
        <li>Data transfer with Globus</li>
      </ul>
    </div>
    <div class="kp-footer">
      <div class="kp-footer-label"></div>
      <div class="kp-footer-val"></div>
    </div>
  </a>

  <a href="https://kir-rescomp.github.io/kir-researchcomp-hub/status" class="kp-card kp-ep7">
    <div class="kp-header">
      <div class="kp-num">07</div>
      <div class="kp-meta">
        <div class="kp-label">Service Status</div>
        <p class="kp-title">BMRC Cluster/Data service status</p>
      </div>
    </div>
    <div class="kp-body">
        <div class="kp-status-mini" id="kp-status-ep6">
          <span class="kp-status-dot kp-dot--loading"></span>
          <span class="kp-status-dot kp-dot--loading"></span>
          <span class="kp-status-dot kp-dot--loading"></span>
          <span class="kp-status-label">Checking services…</span>
        </div>
    </div>
  </a>

</div>

!!! circle-info-2 ""


<div class="section-title" markdown>
## :material-school: Training Catalogue & Technical Essays
</div>

<div style="display: flex; flex-wrap: wrap; gap: 1rem;">
<a href="https://kir-rescomp.github.io/kir-training-home/" class="kp-card kp-training" style="max-width: 480px; text-decoration: none;">
  <div class="kp-header">
    <div class="kp-num">🎓</div>
    <div class="kp-meta">
      <div class="kp-label">KIR Research Computing</div>
      <p class="kp-title">Browse the Training Catalogue →</p>
    </div>
  </div>
  <div class="kp-body">
    <ul class="kp-topics">
      <li>The KIR Research Computing team runs hands-on training workshops covering HPC, 
          bioinformatics workflows, software packaging, and scientific computing. 
          All materials are freely available and self-paced.</li>
    </ul>
  </div>
  </a>

  <a href="https://kir-rescomp.github.io/kir-training-home/" class="kp-card kp-techessays" style="max-width: 480px; text-decoration: none;">
  <div class="kp-header">
    <div class="kp-num">✒️</div>
    <div class="kp-meta">
      <div class="kp-label">KIR Research Computing</div>
      <p class="kp-title">Browse Technical Essays →</p>
    </div>
  </div>
  <div class="kp-body">
    <ul class="kp-topics">
      <li>In-depth articles on HPC, bioinformatics, containers, and scientific 
          computing from the KIR research computing team.</li>
    </ul>
  </div>
  </a>

</div>

- - - 


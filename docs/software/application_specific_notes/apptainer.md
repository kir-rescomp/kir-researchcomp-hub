# Apptainer

`apptainer` is available at the OS level on BMRC — it can be invoked from any node 
without loading a module.

For a full walkthrough, see our dedicated Apptainer training material: (click below) 



<div>
<a href="https://kir-rescomp.github.io/training-intro-to-apptainer/" class="kp-card kp-training" style="max-width: 480px; text-decoration: none;">
  <div class="kp-header">
    <div class="kp-num">🎓</div>
    <div class="kp-meta">
      <div class="kp-label">KIR Research Computing</div>
      <p class="kp-title">Apptainer Training Material →</p>
    </div>
  </div>
  <div class="kp-body">
    <ul class="kp-topics">
      <li>Introduction to containers</li>
      <li>Apptainer cache and temp</li>
      <li>Binding external filesystem</li>
      <li>Pulling images from upstream registies</li>
      <li>How to run with <code>exec</code> and <code>run</code></li>
    </ul>
  </div>
</a>
</div>

## Local container repository 

* Some applications are built and served via Apptainer. These are stored in `/well/kir/mirror/containers`, to which all Kennedy 
  researchers have read access.
* Definition files for these containers are available at: https://github.com/kir-rescomp/Apptainer-def-files
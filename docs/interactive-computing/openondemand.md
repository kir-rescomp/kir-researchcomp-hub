# Interactive Computing with OnDemand


!!! exclamation "Make sure you are connected to VPN"

    Similar to [ssh access](../getting-started/connect_ssh_config.md), OnDemand requires your device to be on Oxford VPN, MSD VPN, or eduroam (no VPN needed if already on eduroam WiFi)

    To log in to OnDemand, enter your BMRC user name and then your ==BMRC password immediately followed by 6-digit second authentication factor in the same password field==.

    <div style="
      background: var(--md-primary-fg-color--light, #f0f4ff);
      border-left: 4px solid var(--md-primary-fg-color);
      border-radius: 6px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    ">
      <div>
        <strong>BMRC Open OnDemand</strong><br>
        <code>ondemand00.bmrc.ox.ac.uk:12000</code>
      </div>
      <a href="https://ondemand00.bmrc.ox.ac.uk:12000/" target="_blank" class="md-button md-button--primary">
        Launch 
      </a>
    </div>

## OnDemand Apps

=== "JupyterLab"
    <p align="center" style="margin-bottom: -1px;">
        <img src="../../assets/images/material/interactive-commputing/ood_jupyter_icon.png" alt="srun" width="250" style="opacity: 0.9;"/>
    </p>


=== "RStudio"
    !!! clipboard-list "Prerequisites"

    Prior to launching `RStudio-server` via **OnDemand**, make sure to setup your `~/.Rprofile` according to [these
    instructions](https://kir-rescomp.github.io/kir-researchcomp-hub/software/application_specific_notes/R/#setting-up-rprofile-dynamic-r-library-paths-version-aware-rprofile-configuration) 
    <p align="center" style="margin-bottom: -1px;">
        <img src="../../assets/images/material/interactive-commputing/ood_rstudio_icon.png" alt="srun" width="250" style="opacity: 0.9;"/>
    </p>

=== "VScode (server)"
    <p align="center" style="margin-bottom: -1px;">
        <img src="../../assets/images/material/interactive-commputing/ood_codeserver_icon.png" alt="srun" width="250" style="opacity: 0.9;"/>
    </p>

=== "Virtual Desktop" 
    <p align="center" style="margin-bottom: -1px;">
        <img src="../../assets/images/material/interactive-commputing/ood_remote_desktop_icon.png" alt="srun" width="350" style="opacity: 0.9;"/>
    </p>
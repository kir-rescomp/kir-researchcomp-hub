# `RStudio-Server` on BMRC

RStudio is available on BMRC through three different access methods.
Choose the one that best fits your need/workflow:

<div class="grid cards" markdown>

-   :material-open-in-app:{ .lg .middle } **Open OnDemand**

    ---
    <span style="font-size: 0.7rem;"> 
    Launch RStudio directly in your browser with a few clicks.
    No SSH tunnels or terminal setup required. Best for everyday interactive work.

    **Recommended for most users.**

    [:octicons-arrow-right-24: Launch via OnDemand](?tab=open-ondemand)
    </span>

-   :material-console:{ .lg .middle } **Manual via `srun`**

    ---
    <span style="font-size: 0.7rem;">
    Start RStudio Server from an interactive Slurm session and connect
    via SSH tunnel. Useful for fine-grained control over resources or
    debugging environment issues outside of OnDemand.
    </span>
    <br/>
    [:octicons-arrow-right-24: Launch with srun](?tab=rstudio-server-via-srun)

-   :material-server:{ .lg .middle } **RStudio Workbench**

    ---
    <span style="font-size: 0.7rem;">
    A shared, always-on RStudio environment accessible at a fixed URL.
    Supports multiple concurrent sessions and persistent projects.
    Best for users who prefer a persistent workspace.
    </span>
    [:octicons-arrow-right-24: Access Workbench](?tab=posit-workbench)
</div>


!!! clipboard-list "Prerequisites"

    Prior to launching `RStudio-server` via `srun`, make sure to setup your `~/.Rprofile` according to [these
    instructions](https://kir-rescomp.github.io/kir-researchcomp-hub/software/application_specific_notes/R/#setting-up-rprofile-dynamic-r-library-paths-version-aware-rprofile-configuration) 


=== "Open OnDemand" 
    Some content

=== "Rstudio server via srun" 

    <div class="nord" markdown=1> 

    1. First, login to BMRC ( any login node ) and then start an `srun` interactive session on the cluster, requesting an appropriate amount of resources for your intended calculations. For example, 3 CPU slots with a total of 20GB of memory:

        ```py
        srun --partition short --cpus-per-task 3 --mem 20G --pty bash
        ```

    2. From within your interactive session, load the standalone `RStudio-Server/2025.09.2-418` module and the R module of interest . For an example, `R/4.5.1-gfbf-2023a-bare-noSciPy` 

        ```py
        module load RStudio-Server/2025.09.2-418
        module load R/4.5.1-gfbf-2023a-bare-noSciPy
        ```

    3. Start your RStudio service by running:

        ```py
        /apps/misc/R/bmrc-r-user-tools/rstudio/rserver.sh
        ```

        - The script above will start RStudio on a suitable free port and provide instructions for how to connect to and log into the RStudio from your own computer.

    4. On your own computer, open a new terminal window and create an ssh tunnel to the RStudio server by running the `ssh` command suggested in the instructions.

    5. In your browser, navigate to the address shown in the instructions and you should see the RStudio login screen.

        !!! circle-info-2 "Login is required to access RStudio sessions. Please use your BMRC credentials and follow the instructions on how to log into the session."
         

=== "Posit Workbench" 
    
    Some content

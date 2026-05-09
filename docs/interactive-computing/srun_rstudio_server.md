# `RStudio-Server` with `srun`

!!! lightbulb "Recommended approach"
    The easiest and recommended way to run RStudio-Server on BMRC is through
    **[Open OnDemand](./openondemand.md)**, which handles session management,
    port forwarding, and environment setup automatically — no terminal tunnelling required.

    The manual method described on this page is useful when you need finer control
    over your session (e.g. memory layouts, or debugging
    environment issues outside of OnDemand).

!!! clipboard-list "Prerequisites"

    Prior to launching `RStudio-server` via `srun`, make sure to setup your `~/.Rprofile` according to [these
    instructions](https://kir-rescomp.github.io/kir-researchcomp-hub/software/application_specific_notes/R/#setting-up-rprofile-dynamic-r-library-paths-version-aware-rprofile-configuration) 
    
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

    > Login is required to access RStudio sessions. Please use your BMRC credentials and follow the instructions on how to log in into the session. 





# Working with job scheduler

<p align="center" style="margin-bottom: -1px;">
    <img src="../../assets/images/material/batch-computing/scheduler_image.png" alt="data-transfer-cli" width="700" style="opacity: 0.9;"/>
</p>


## Introduction to slurm scheduler and directives

An HPC system might have thousands of nodes and thousands of users. How do we decide who gets what and when? How do we ensure that a task is run with the resources it needs? This job is handled by a special piece of software called the scheduler. On an HPC system, the scheduler manages which jobs run where and when. In brief, scheduler is a 

!!! quote ""

    * Mechanism to control access by many users to shared computing resources
    * Queuing / scheduling system for users’ jobs
    * Manages the reservation of resources and job execution on these resources 
    * Allows users to “fire and forget” large, long calculations or many jobs (“production runs”)

!!! circle-info "A bit more on why do we need a scheduler ?"

    * To ensure the machine is utilised as fully as possible
    * To ensure all users get a fair chance to use compute resources (demand usually exceeds supply)
    * To track usage - for accounting and budget control
    * To mediate access to other resources e.g. software licences

    **Commonly used schedulers**
    
    * [x] Slurm
    * PBS , Torque
    * Grid Engine
    
    All NeSI clusters use Slurm (Simple Linux Utility for Resource Management) scheduler (or job submission system) to manage resources and how they are made available to users.

   

    <p align="center" style="margin-bottom: -1px;">
        <img src="../../assets/images/material/batch-computing/slurm_comms2compute.png" alt="data-transfer-cli" width="700" style="opacity: 0.9;"/>
    </p>

    <small>Researchers can not communicate directly to  Compute nodes from the login node. Only way to establish a connection OR send scripts to compute nodes is to use scheduler as the carrier/manager</small>
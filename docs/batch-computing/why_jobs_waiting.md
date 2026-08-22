# Why are my jobs waiting?

When you submit a job to the cluster, it does not always start immediately. Slurm places
the job in a **PENDING (PD)** state and records a **REASON** explaining ( abstract )  why it has not yet
started. In the large majority of cases a pending job is entirely normal and requires no
action.i.e.the scheduler is simply waiting for the right conditions to run it.
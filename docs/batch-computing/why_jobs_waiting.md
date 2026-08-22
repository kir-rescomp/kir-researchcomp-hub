# Why are my jobs waiting?

When you submit a job to the cluster, it does not always start immediately. Slurm places
the job in a **PENDING (PD)** state and records a **REASON** explaining ( abstract )  why it has not yet
started. In the large majority of cases a pending job is entirely normal and requires no
action.i.e. the scheduler is simply waiting for the right conditions to run it.


You can inspect the reason for your own pending jobs with:

<div class="nord" markdown="1">
```py
squeue --me --states=PENDING
```
</div>

The **`NODELIST(REASON)`** column shows the pending reason in parentheses. The sections below
explain the reasons you are most likely to encounter, and which ones &mdash; if any &mdash;
call for action on your part.

!!! tip "Quick guidance"
    Most pending reasons resolve on their own. `Priority` and `Resources` require nothing
    from you. `PartitionConfig` and `ReqNodeNotAvail` (reservations) usually indicate that
    something in your submission needs correcting.
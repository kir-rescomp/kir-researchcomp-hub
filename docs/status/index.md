# Service Status

<h1></h1>

!!! warning "[INCIDENT] BMRC Slurm accounting database connectivity issue (sacct will fail) "
    We are currently experiencing an issue reaching the Slurm accounting database from cluster nodes. BMRC users will  see errors such as:
    ```
    sacct: error: _open_persist_conn: failed to open persistent connection to host:slurmdbd1.hpc.in.bmrc.ox.ac.uk:6819: Connection refused
    sacct: error: Sending PersistInit msg: Connection refused
    sacct: error: Problem talking to the database: Connection refused
    ```
    At this stage, this appears to affect Slurm accounting queries such as sacct and may impact workflow systems that poll job state between steps. Jobs themselves should still run normally, since they do not usually need to query the accounting database during execution; however, tools that depend on accounting/status lookups may report failures or unreachable job states while the issue persists.

<div id="cluster-status">
  <p>Loading status...</p>
</div>

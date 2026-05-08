# Jupyter Notebook and Jupyter Lab with `srun` 

!!! lightbulb "Recommended approach"
    The easiest and recommended way to run Jupyter on BMRC is through
    **[Open OnDemand](./openondemand.md)**, which handles session management,
    port forwarding, and environment setup automatically — no terminal tunnelling required.

    The manual method described on this page is useful when you need finer control
    over your session (e.g. memory layouts, or debugging
    environment issues outside of OnDemand).

---

## Prerequisites

Before starting, make sure you have:

1. Access to `JupyterLab/4.5.6-GCCcore-12.3.0` module ( or any `JupyterLab`  > 4.5.6 which have  all of the required extensions pre-installed )
2. **OR** If you prefer to use your own Python virtual environment and not the module, create one according to [these instructions](../software/application_specific_notes/Python.md) and install both `JupyterLab` and `notebook` 

     <div class="nord" markdown=1>
    ```py
    pip install --force notebook   # for Jupyter Notebook
    pip install jupyterlab         # for Jupyter Lab (optional)
    ```
    </div>

---

## Step 1 — Start an interactive session

Log into  any of the BMRC login nodes and request an interactive node. For example, 2 CPUs and 30 GB of memory on the `short` partition:

<div class="nord" markdown=1>
```py
srun -p short --cpus-per-task 2 --mem=30G --pty bash
```

Once the session starts, note the hostname of the node you have been assigned:

```rust
hostname
# e.g. compe023
```

---

## Step 2 — Activate your Python environment

Load the Python module and activate the matching virtual environment.
Select the tab for the toolchain you are using:

=== "Using `Python/3.11.3-GCCcore-12.3.0` module as an example"

    ```py
    module Python/3.11.3-GCCcore-12.3.0
    source ~/devel/venv/Python/3.11.3-GCCcore-12.3.0/bin/activate
    ```
---

## Step 3 — Start the Jupyter server

Change into the directory where your notebooks are stored, then launch the server.
Select the tab for the interface you want:

=== "Jupyter Lab"

    Load a compatible Node.js module before starting Lab:

    ```py
    cd ~/notebooks
    module load nodejs/18.12.1-GCCcore-12.2.0
    jupyter lab --no-browser --ip=*
    ```

=== "Jupyter Notebook"

    No additional modules are needed:

    ```py
    cd ~/notebooks
    jupyter notebook --no-browser --ip=*
    ```

Once the server starts you will see output similar to:

```py
I 2026-05-08 18:53:03.587 ServerApp] jupyter_lsp | extension was successfully linked.
[I 2026-05-08 18:53:03.592 ServerApp] jupyter_server_terminals | extension was successfully linked.
[I 2026-05-08 18:53:03.596 ServerApp] jupyterlab | extension was successfully linked.
[I 2026-05-08 18:53:03.600 ServerApp] notebook | extension was successfully linked.
[I 2026-05-08 18:53:04.492 ServerApp] notebook_shim | extension was successfully linked.
[W 2026-05-08.....................
.........................
    To access the server, open this file in a browser:
        ...

    Or copy and paste one of these URLs:
        http://localhost:8888/lab?token=b358a08f791d96bdd3ff8139a...............
        http://127.0.0.1:8888/lab?token=b358a08f791d96bdd3ff8139a...............
```

!!! square-pen "Note down two things"
    1. The **port number** (e.g. `8888`) — it may differ if that port is already in use on the node.
    2. The full URL beginning with `http://127.0.0.1:` — you will paste this into your browser later.

---

## Step 4 — Create an SSH tunnel

On your **local machine** (not the cluster), open a new terminal and run:

* If you have setup the local terminal  `~/.ssh/config` according to [these instructions](../getting-started/connect_ssh_config.md), replace  `username@cluster1.bmrc.ox.ac.uk`
   with the shorter hostname .i.e.`bmrc1` ,etc. 

```py
ssh -L 8888:compe023:8888 username@cluster1.bmrc.ox.ac.uk
```

Substitute:

| Placeholder | Replace with |
|---|---|
| `8888` (first) | Your local port — change this if 8888 is already in use locally |
| `compe023` | The node hostname from Step 1 |
| `8888` (second) | The port Jupyter is listening on (from Step 3) |
| `cluster1` | `cluster2` if that is where your session is running |
| `username` | Your BMRC username |

!!! warning "Port already in use locally?"
    If port `8888` is already occupied on your laptop, use a different local port,
    for example `9999`:

    ```py
    ssh -L 9999:compe023:8888 username@cluster1.bmrc.ox.ac.uk
    ```

    In this case you must also change the port in the URL you paste into your
    browser (see Step 5).

The tunnel command will open a normal-looking SSH session. Leave this terminal
open for as long as you need to use Jupyter.

---

## Step 5 — Open Jupyter in your browser

Copy the `http://127.0.0.1:...` URL from Step 3 and paste it into a browser on
your local machine. Jupyter will load.

!!! warning "Changed your local port?"
    If you used a different local port (e.g. `9999`) in Step 4, edit the port in
    the URL before opening it:

    ```py
    http://127.0.0.1:9999/lab?token=abc123...
    ```


---

## Ending your session

When you are finished:

1. Shut down the Jupyter server from the Lab/Notebook interface, or press
   `Ctrl+C` twice in the terminal running the server.
2. Deactivate the virtual environment: `deactivate`
3. Exit the interactive Slurm session: `exit`
4. Close the SSH tunnel terminal.

!!! lightbulb "Tip"
    Leaving an interactive Slurm session idle wastes cluster resources and counts
    against your allocation. Always exit when you are done.
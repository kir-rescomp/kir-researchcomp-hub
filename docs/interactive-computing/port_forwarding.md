# Accessing a Web Service Running on a Compute Node


Some workflows on BMRC requires us  to start a web-based service ( 
FastAPI/Flask app, a Dash/Streamlit dashboard, LLM serverrs, etc.) inside a
Slurm job, then open it in a browser on your **local machine**.

Because compute nodes are not directly reachable — you cannot `ssh` to them and
you cannot point a browser at them — you tunnel through a **login node** using
SSH port-forwarding.

<div class="nord" markdown="1">
```py
your laptop ── ssh tunnel──▶  login node  ──cluster network──▶  compute node:PORT
```
</div>


!!! note-sticky "Why not just SSH to the compute node?"
    Direct `login → compute` SSH is blocked on BMRC. The login node acts as the
    jump point: it *can* reach compute nodes over the internal network, so we
    forward a local port through it.

## Step 1 — Start your service on the compute node

Request an allocation and bind your service to `0.0.0.0` (all interfaces) on a
port of your choice. Binding to `127.0.0.1` only works if you also tunnel
*through* the node, so `0.0.0.0` is simpler.

<div class="nord" markdown="1">
```py
# Interactive allocation on a GPU node (adjust partition/account as needed)
srun --partition=gpu_gh200_144gb --account=gpu_kir.prj \
     --gpus-per-task=1 --pty bash

# Once on the node, note the hostname — you'll need it for the tunnel
hostname          # e.g. compgh000

# Start your service, listening on all interfaces
# This example is based on https://github.com/kir-rescomp/gh200_benchmarking/tree/main/fastapi_server
uvicorn app:app --host 0.0.0.0 --port 8080
```
</div>

!!! lightbulb "Tip : Pick a high, non-standard port"
    Use something in the 8000–9000 range (e.g. `8080`, `8888` OR even higher suh 10010). Avoid common
    defaults if several people share a node — two services on the same port
    will collide.

## Step 2 — Open the tunnel from your laptop

In a **new terminal on your local machine**, forward a local port to the
service. Replace `compgh000` with the hostname from Step 1 and `<login_node>`
with your usual BMRC login host.

<div class="nord" markdown="1">
```py
ssh -N -L 8080:compgh000:8080 <login_node>
```
</div>

| Flag                     | Meaning                                                      |
| ------------------------ | ------------------------------------------------------------ |
| `-L 8080:compgh000:8080` | Forward **local** `8080` → `compgh000:8080` *via the login node* |
| `-N`                     | Do not open a remote shell — just hold the tunnel open       |

The tunnel stays alive as long as this command runs. Leave the terminal open,
or append `&` to background it.

!!! warning "The hostname resolves on the login node, not your laptop"
    `compgh000` is resolved by the login node, which is why this works even
    though your laptop has no idea what `compgh000` is. The login node forwards
    the connection across the internal cluster network.

## Step 3 — Open it in your browser

<div class="nord" markdown="1">
```py
http://localhost:8080
```
</div>

You should see your service. If it shows the compute node's hostname anywhere,
that confirms the tunnel reaches all the way through.

## Quick sanity check (optional)

Before tunnelling, you can confirm the service is actually up from *within*
the cluster using `srun --overlap` to attach a second step to your running job:

<div class="nord" markdown="1">
```py
# In another terminal on a login node
squeue -u $USER                       # find your JOBID

srun --jobid=<JOBID> --overlap \
     curl -s http://127.0.0.1:8080/health
```
</div>

`--overlap` lets a second step share the existing allocation without waiting
for or consuming extra resources. This only tests reachability *on the node* —
it does not open anything locally. If you just want to use the service in a
browser, skip straight to the SSH tunnel.

## Troubleshooting

| Symptom                                  | Likely cause                                                 | Fix                                                          |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `channel 2: open failed: connect failed` | Service not running, or wrong port/host                      | Check the service is up; verify hostname with `hostname` on the node |
| `bind: Address already in use` (locally) | Local port already taken                                     | Pick a different **left-hand** port, e.g. `-L 8090:compgh000:8080` |
| Browser hangs / blank page               | Service bound to `127.0.0.1` *and* you didn't tunnel through the node | Bind to `0.0.0.0`, or tunnel via the node                    |
| Tunnel drops after a while               | SSH idle timeout                                             | Add `-o ServerAliveInterval=60` to the ssh command           |

## Mapping a different local port

If `8080` is busy on your laptop, change only the left-hand number —  the
service doesn't need to know:

<div class="nord" markdown="1">
```py
ssh -N -L 9999:compgh000:8080 <login_node>
# → browse to http://localhost:9999
```
</div>
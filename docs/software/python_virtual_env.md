# Python Virtual Environments

Virtual environments are isolated Python installations that let you manage packages on a per-project basis — without affecting the system Python or other users' work. On BMRC, all package installation should happen inside a virtual environment.

---

## `uv` — Recommended :rocket:

!!! success "Start here"
    `uv` is the recommended way to create and manage Python environments on BMRC. It requires no Python module, supports any Python version, and is dramatically faster than `pip`.

[`uv`](https://docs.astral.sh/uv/) is a next-generation Python package manager written in Rust. It is a **drop-in replacement for `pip`** — same commands, same workflow — but significantly faster, with built-in Python version management so you no longer need to load a Python module before creating an environment.

### Benchmark results

All timings measured on BMRC cluster nodes — cold install, no cache. Wall-clock time reported.

| Package               | `pip`   | `uv`   | Speedup  | Notes                |
| --------------------- | ------- | ------ | -------- | -------------------- |
| `torch`               | 190.2 s | 35.5 s | **5.4×** | ~2 GB wheel          |
| `transformers[torch]` | 74.7 s  | 43.4 s | **1.7×** | Deep dependency tree |
| `anndata`             | 19.9 s  | 5.8 s  | **3.5×** | scRNA-seq standard   |
| `tensorflow`          | 45.8 s  | 20.0 s | **2.3×** | Large ML framework   |

#### Why is `uv` so fast?

`uv` uses aggressive parallel downloading, a global package cache, and a custom dependency resolver — things `pip` handles sequentially in Python. Even on a cold install with no cache, `uv` saturates available bandwidth far more efficiently.

On `torch` — one of the largest Python packages at ~2 GB of wheels — `uv` completed in **35 seconds** vs `pip`'s **3 minutes 10 seconds**. When packages are already in the shared `uv` cache (e.g. recreating an environment), the speedup is even more pronounced.

### No Python module? No problem.

One of `uv`'s most practical advantages on BMRC: **it ships its own Python**. You no longer need to load a Python module before creating a virtual environment. `uv` will download and manage the right Python version automatically — including versions not currently provided as cluster modules.

=== ":x: Old way (pip)"

    ```
    # Must load a Python module first
    module load Python/3.11.3-GCCcore-12.3.0
    
    # Then create the environment
    python -m venv ~/devel/virtual_envs/myenv
    source ~/devel/virtual_envs/myenv/bin/activate
    pip install numpy pandas
    
    # Limited to whatever version the cluster currently provides
    ```

=== ":white_check_mark: New way (uv)"

    ```bash
    # No module load needed — uv manages Python for you
    uv venv ~/devel/virtual_envs/myenv --python 3.12
    source ~/devel/virtual_envs/myenv/bin/activate
    uv pip install numpy pandas
    
    # Python 3.12 downloaded automatically if not present
    ```

### Quick start on BMRC

`uv` is already included in the **KIR-utils** module for Kennedy researchers. For other BMRC users, load the `uv` module:

<div class="nord" markdown=1>
```py
module load uv
```

Then use it exactly as you would `pip`:

```py
# Create a virtual environment (specify any Python version)
uv venv ~/devel/virtual_envs/myenv --python 3.12
source ~/devel/virtual_envs/myenv/bin/activate

# Install packages — identical syntax to pip
uv pip install torch numpy pandas
uv pip install -r requirements.txt

# Inspect the environment
uv pip list
uv pip freeze > requirements.txt
```

!!! lightbulb "Shared project environments"
    For environments shared across a group, create them under `/well/{group}/projects/{project}/` and ensure group read permissions are set. The shared `uv` cache means collaborators benefit from already-downloaded wheels automatically.

---

## Using the Python module

!!! note-sticky "When to use this method"
    Use this approach if you need a specific cluster-managed Python version, are maintaining an existing environment built against a cluster module, or your workflow requires it for reproducibility.

The cluster provides pre-built Python modules via Lmod. These integrate cleanly with the GPFS filesystem and pin your environment to a specific, tested Python build.

### 1. Choose a location

We recommend creating your environments under your personal `devel` directory or within a shared project directory:

| Use case                    | Recommended path                    |
| --------------------------- | ----------------------------------- |
| Personal development        | `/well/{group}/{user}/devel/`       |
| Shared project environments | `/well/{group}/projects/{project}/` |

!!! warning "Avoid your home directory"
    Your home directory (`/home/{user}`) has a strict quota. Large environments with packages like PyTorch or TensorFlow can easily consume several gigabytes — always use `/well` storage.

### 2. Load a Python module

Check what versions are available with:

```py
module spider Python
```
and load the version you prefer 

```py
module load Python/3.11.3-GCCcore-12.3.0
```

### 3. Create and activate the environment

```py
# Create the environment
python -m venv ~/devel/virtual_envs/myenv

# Activate it
source ~/devel/virtual_envs/myenv/bin/activate
```

!!! lightbulb "Finding your `devel` directory"
    - Replace `{group}/{user}` in any paths with your actual **group** and **username** — or simply navigate there with `cd ~/devel`, as all home directories have a pre-populated symlink to this location.
    - We recommend keeping all your virtual environments together under a single parent directory — e.g. `~/devel/virtual_envs/` — so they are easy to find and manage.

Your prompt will change to show the active environment name once activated.

### 4. Install packages and work

```py
pip install numpy pandas scipy

# Save your environment's package list and ideally push this to Github
pip freeze > requirements.txt

# Deactivate when done
deactivate
```

### Reusing the environment in future sessions

You must reload the Python module **and** re-activate the environment at the start of each session:

```py
module load Python/3.11.3-GCCcore-12.3.0
source ~/devel/virtual_envs/myenv/bin/activate
```

!!! note-sticky "Slurm jobs"
    In Slurm job scripts, include both the `module load` and `source activate` lines before calling any Python commands.
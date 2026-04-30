# Python Virtual Environments 

Virtual environments are isolated Python installations that let you manage packages on a per-project basis — without affecting the system Python or other users' work. 


## Creating a virtual environment with the Python module

The cluster provides pre-built Python modules via Lmod. These integrate cleanly with the GPFS filesystem and are the standard starting point if you need a specific cluster-managed Python version.

### 1. Choose a location

We recommend creating your environments under your personal `devel` directory or within a shared project directory:

| Use case                    | Recommended path                    |
| --------------------------- | ----------------------------------- |
| Personal development        | `/well/{group}/{user}/devel/`       |
| Shared project environments | `/well/{group}/projects/{project}/` |

!!! tip "Why not your home directory?"
    Your home directory (`/home/{user}`) has a strict quota. Large environments with packages like PyTorch or TensorFlow can easily consume several gigabytes — always use `/well` storage.


### 2. Load a Python module

<div class="nord" markdown=1>

Check what's available with `module spider` and then load with `module load`

```py
module spider Python
```


```py
module load Python/3.11.3-GCCcore-12.3.0
```

### 3. Create and activate the environment

- Replace `{group}/{user}` with your **group** and **username** OR direct your session to that path with `cd ~/devel` as all your home directories 
  have a pre-popluated symlink to this directory
- Also, we recommend storing all the virtual environments under a one parent directory. Let's say `virtual_env` 

```py
mkdir -p /well/{group}/{user}/devel/virtual_env
``` 
- Then create a new environment named, `myenv` within `virtual_env`

```py
# Create the environment
python -m venv /well/{group}/{user}/devel/virtual_env/myenv

# Activate it
source /well/{group}/{user}/devel/virtual_env/myenv/bin/activate
```

Your prompt will change to show the active environment name.

### 4. Install packages and work

```py
pip install numpy pandas scipy

# Save your environment's package list for reproducibility. Ideally push it to Github
pip freeze > requirements.txt

# Deactivate when done
deactivate
```

### 
# Pixi

>a faster, reproducible replacement for `conda`/`mamba`


[Pixi](https://pixi.prefix.dev/latest/) is a package manager built on the conda ecosystem — it resolves packages from the same channels (`conda-forge`, `bioconda`) and produces fully compatible environments. It is written in Rust, uses a significantly faster solver, and is designed around project-level reproducibility from the start.

!!! lightbulb "Why switch?"
    If you already use conda or mamba, the learning curve is minimal. The payoff is faster installs, exact reproducibility, and no base environment cluttering your shell.

---
<div class="nord" markdown=1>
## Loading Pixi on BMRC

Pixi is available as a module — there is no base environment to activate, no `conda init`, and no changes to your `.bashrc`:

```py
module load Pixi
```

Each project carries its own isolated environment stored in a `.pixi/` directory inside the project folder.

---

## Getting started

### 1. Initialise a project

In your project directory:

```py
pixi init .
```

This creates a `pixi.toml` file that describes your project's dependencies, channels, and platforms. It is the equivalent of `environment.yml`, but machine-written and kept in sync automatically.

### 2. Add packages

```py
# From conda-forge (default)
pixi add numpy scipy scanpy

# From bioconda
pixi add --channel bioconda samtools
```

Every `pixi add` resolves the full dependency graph and updates `pixi.lock` — a file that records the exact URL and hash of every package for every platform.

### 3. Run your code

Rather than activating an environment, use `pixi run`:

```py
pixi run python my_analysis.py
pixi run jupyter lab
```

For interactive sessions (e.g. debugging, exploratory work), you can drop into a shell with the environment active:

```py
pixi shell
```

### 4. Commit your lock file to Git

```py
git add pixi.toml pixi.lock
git commit -m "Add pixi environment"
```

Anyone cloning the repository can then reproduce the exact environment with:

```py
pixi install
```

---

## Using Pixi in Slurm job scripts

Replace `conda activate` with `pixi run` in your job scripts:

=== "conda / mamba"

    ```py
    #!/bin/bash
    #SBATCH ...
    source activate myenv
    python my_analysis.py
    ```

=== "Pixi"

    ```py
    #!/bin/bash
    #SBATCH ...
    module load Pixi
    pixi run python my_analysis.py
    ```

    If your script runs many commands and you want to avoid prefixing each one with `pixi run`, use the shell hook to activate the environment in-place:

    ```py
    module load Pixi
    eval "$(pixi shell-hook)"

    python step_one.py
    Rscript step_two.R
    ```

---

## PyPI packages

Pixi has native PyPI support alongside conda packages — no separate `pip install` calls needed. Add a `[pypi-dependencies]` section to your `pixi.toml`:

```toml
[pypi-dependencies]
my-package = ">=1.2.0"
```

Or via the command line:

```py
pixi add --pypi my-package
```
</div>
Pixi resolves conda and PyPI dependencies together, avoiding the silent conflicts that can arise from mixing `conda install` and `pip install`.

---

## Command reference

| Task | conda / mamba | Pixi |
|------|--------------|------|
| Install package | `conda install numpy` | `pixi add numpy` |
| Install from bioconda | `conda install -c bioconda samtools` | `pixi add --channel bioconda samtools` |
| Run command in environment | `conda activate myenv && python ...` | `pixi run python ...` |
| Interactive shell | `conda activate myenv` | `pixi shell` |
| List installed packages | `conda list` | `pixi list` |
| Reproduce environment | `conda env create -f environment.yml` | `pixi install` |
| Update all packages | `conda update --all` | `pixi update` |
| Remove environment | `conda env remove -n myenv` | `rm -rf .pixi/` |

---
<div class="nord" markdown=1>
## Migrating from conda

### From an `environment.yml`

If you have an existing conda environment file, Pixi can import it directly:

```py
pixi init --import environment.yml
```

This creates a `pixi.toml` from your channels, dependencies, and constraints, then generates a fresh `pixi.lock`. Review the output to confirm everything looks correct before removing the old environment.

### From an active conda environment

If you do not have an `environment.yml` but have an active environment, export it first:

```py
conda activate myenv
conda env export --from-history > environment.yml
pixi init --import environment.yml
```

!!! note-sticky "`--from-history`"
    This exports only the packages you explicitly requested, not the full transitive dependency tree. Pixi will re-resolve dependencies from scratch, which gives a cleaner result than exporting the entire pinned environment.

### Verifying the migration

Once imported, check that everything resolves as expected:

```py
pixi install
pixi run python -c "import scanpy; print(scanpy.__version__)"
```
</div>
---

## Why Pixi is faster and more reproducible

**Speed.** Benchmarked on a BMRC head node, creating a `scanpy` + `anndata` environment:

| Tool | Command | Wall time |
|------|---------|-----------|
| mamba | `mamba create -n bench_env -c conda-forge -c bioconda scanpy anndata -y` | 1 min 39 s |
| Pixi | `pixi add scanpy scipy` | 14.9 s |

Pixi resolved and installed the same packages **×6.7 faster** than mamba — and mamba is already the fastest conda-compatible solver available.

**Reproducibility.** Conda environments created from `environment.yml` are not fully reproducible: running `conda env create` six months later can silently install different transitive dependency versions as packages on conda-forge update. The `--explicit` workaround produces a platform-specific file that cannot be shared between Linux and macOS.

Pixi solves this with `pixi.lock`, which records the exact URL and hash of every package, for every platform, in a single human-readable file:

| | conda + `environment.yml` | Pixi + `pixi.lock` |
|--|--------------------------|-------------------|
| Exact reproducibility | No | Yes |
| Cross-platform lock file | No (`--explicit` is Linux-only) | Yes |
| VCS-friendly | Partial | Yes |
| Auto-updated on changes | No | Yes |

---


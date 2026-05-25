## AlphaFold3

AlphaFold3 can predict protein structures with atomic accuracy, even where no similar structure is known. On the BMRC cluster, AlphaFold3 is available via an Apptainer container, loaded through the module system.

### Licence

!!! warning "Please read the AlphaFold3 licence before use" AlphaFold3 is subject to a specific licence agreement. Please review the [AlphaFold3 Licence](https://github.com/google-deepmind/alphafold3/blob/main/LICENSE) before using this software on the cluster."

### Obtaining Model Parameters

!!! quote "From the [AlphaFold3 repository](https://github.com/google-deepmind/alphafold3)" This repository contains all necessary code for AlphaFold 3 inference. To request access to the AlphaFold 3 model parameters, please complete [this form](https://forms.gle/svvpY4u2jsHEwWYS6). Access will be granted at Google DeepMind's sole discretion. We will aim to respond to requests within 2–3 business days. You may only use AlphaFold 3 model parameters if received directly from Google. Use is subject to these [terms of use](https://github.com/google-deepmind/alphafold3/blob/main/WEIGHTS_TERMS_OF_USE.md)"

Once you have been granted access, download the model parameters to your own storage and note the path — you will need it when submitting jobs.

### Databases

The AlphaFold3 public databases are centrally hosted on the cluster and are readable by all users:

<div class="nord" markdown=1>
```py
/well/kir/mirror/alphafold3_db/22-May-2026/
```
</div>

You do not need to download or maintain your own copy.

### Search for the Module

<div class="nord" markdown=1>

```py
module spider AlphaFold3/3.0.2
```
</div>

This exposes `run_alphafold.py` as a shell function, pre-configured to run inside the container. The required GPFS paths and GPU/XLA settings are set automatically.

### Running AlphaFold3

!!! lightbulb "AlphaFold3 requires a GPU" AlphaFold3 must be run on a GPU node. See the [GPU Jobs guide](https://kir-rescomp.github.io/kir-researchcomp-hub/batch-computing/using_gpus/) for details on requesting GPU resources and choosing the right partition."

Prepare your input JSON file (see the [AlphaFold3 docs](https://github.com/google-deepmind/alphafold3) for the input format), then submit a job script along the following lines:


<div class="nord" markdown=1>
```rust
#!/bin/bash

#SBATCH --account       gpu_kir.prj
#SBATCH --job-name      alphafold3
#SBATCH --partition     gpu_a100_40gb    # Just an example. You can chose another GPU partition if needed
#SBATCH --gres          gpu:1
#SBATCH --mem           64G
#SBATCH --cpus-per-task 8
#SBATCH --time          04:00:00

module purge
module load AlphaFold3/3.0.2

run_alphafold.py \
    --json_path=/path/to/fold_input.json \
    --model_dir=/path/to/your/models \
    --db_dir=/well/kir/mirror/alphafold3_db/22-May-2026/ \
    --output_dir=/path/to/output/
```
</div>

Replace `/path/to/your/models` with the path to your downloaded model parameters.

### Further Reading

- [AlphaFold3 GitHub repository](https://github.com/google-deepmind/alphafold3)
- [AlphaFold3 input format documentation](https://github.com/google-deepmind/alphafold3/blob/main/docs/input.md)
- [BMRC GPU Jobs guide](https://kir-rescomp.github.io/kir-researchcomp-hub/batch-computing/using_gpus/)
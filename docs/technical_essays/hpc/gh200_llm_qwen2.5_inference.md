# GH200 Grace Hopper: LLM Inference Performance (Qwen2.5-72B, FSDP)


!!! github "[Click Here](https://github.com/kir-rescomp/gh200_benchmarking/tree/main/fsdp_llm_train) to review the scripts used in this benchmarking test"


## What this test does

This test loads a 72-billion parameter large language model (Qwen2.5-72B) across
both GH200 GPUs and runs repeated forward passes at a sequence length of 8,192
tokens. It is the most direct demonstration that the GH200 nodes can handle the
scale of model that researchers actually want to run.

The model is sharded across both GPUs using PyTorch's Fully Sharded Data Parallel
(FSDP) framework. Each GPU holds approximately half the model weights (~72 GB of
BF16 parameters), and the two GPUs communicate via NVLink4 during each forward
pass to exchange the weight shards they need from each other. Flash Attention 2 is
used throughout to keep sequence-level memory usage efficient.

## Why it matters

A 72B parameter model in full BF16 precision occupies ~144 GB — more than a single
GPU can hold. Running it requires two GPUs working in close coordination, which is
exactly what the NVLink4 interconnect between the two GH200 superchips on each node
is designed for. This test confirms that the full memory capacity and inter-GPU
bandwidth of the node are accessible and functioning correctly.

For researchers, this translates directly to the ability to run or fine-tune
foundation models (biomedical LLMs, protein language models, nucleotide
transformers, multimodal models) that would not fit on a single GPU.

## Results

<div class="center-table" markdown="1">

| Metric | Value |
|---|---|
| Model | Qwen2.5-72B (BF16) |
| GPUs | 2× NVIDIA GH200 144GB |
| Sequence length | 8,192 tokens |
| Batch size | 8 per GPU |
| VRAM utilised | 118.7 GB / 144 GB per GPU (82%) |
| Throughput | 9,182 tokens/s (both GPUs combined) |
| Mean step time | 14.27s |
| Step time variance | < 0.1% across 90 production steps |
| Thermal stability | No throttling observed |

</div>

!!! circle-info "On throughput and batch size"
    Increasing batch size from 1 to 8 produces only a modest throughput gain
    (8,695 → 9,182 tokens/s) because inference on a 72B model is
    **memory-bandwidth bound** — the bottleneck is loading ~72 GB of weight
    shards from HBM3e each step, a cost that changes little regardless of how
    many sequences are processed simultaneously. Users seeking higher throughput
    should run multiple concurrent jobs rather than increasing batch size.

## What this confirms for users

!!! quote ""
    - Both GH200 GPUs are functioning and addressable
    - NVLink4 GPU-to-GPU communication is working correctly
    - 87% of the 144 GB HBM3e per GPU is accessible under a realistic workload
    - The node can sustain large model inference without throttling or instability
    - Models requiring up to ~280 GB combined GPU memory can be run on a single node
# Available LLM models

A shared mirror of large language models is available at
`/well/kir/mirror/LLM/`. No download or HuggingFace token is needed to use
these.

### HuggingFace format (for use with `transformers`, FSDP, vLLM, etc.)

| Model             | Path                                                         |
| ----------------- | ------------------------------------------------------------ |
| BERT base uncased | `/well/kir/mirror/LLM/huggingface/google-bert-bert-base-uncased/` |
| Qwen2.5-72B       | `/well/kir/mirror/LLM/huggingface/Qwen-Qwen2.5-72B`          |

Load directly in Python:

<div class="nord" markdown="1">
```py
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "/well/kir/mirror/LLM/huggingface/Qwen-Qwen2.5-72B",
    torch_dtype="bfloat16",
    device_map="auto",
)
```
</div>

### Ollama models 

??? circle-info "models which can be used with `ollama serve`"

    | Model            | Tag                |
    | ---------------- | ------------------ |
    | Llama 3.1        | `llama3.1`         |
    | Llama 3.2        | `llama3.2`         |
    | Llama 4          | `llama4`           |
    | Gemma 4          | `gemma4`           |
    | Mistral          | `mistral`          |
    | Qwen3 Coder      | `qwen3-coder-next` |
    | Nomic Embed Text | `nomic-embed-text` |

    Set the model directory before starting Ollama:

    <div class="nord" markdown="1">
    ```py
    export OLLAMA_MODELS=/well/kir/mirror/LLM/ollama/models
    ollama serve &
    ollama run llama3.1
    ```
    </div>

!!! info "Need a model that isn't listed?"
    Contact KIR Research Computing and we can download it to the shared path.
    Do not download large models to your home directory or scratch space
    without checking storage quotas first.
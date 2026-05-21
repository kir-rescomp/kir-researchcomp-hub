<h1 align="center">KIR Research Computing Hub</h1>

<h3 align="center">https://kir-rescomp.github.io/kir-researchcomp-hub/</h3>

<p align="center" style="margin-bottom: -50px;">
    <img src="docs/assets/images/icons/KIR_Research_Computing_Hub_layered_logo.svg" alt="kir-rescomp-logo" width="450" style="opacity: 0.9;"/>
</p>



## Contributing

The `main` branch is protected — all changes must be submitted via a pull request.

For minor edits (typos, small wording fixes), you can edit the Markdown files directly in your editor as you would with any GitHub repository and open a PR without needing a local preview.

For larger changes, a live preview of the rendered site is recommended. Follow the steps below to set up MkDocs locally.

### Local preview setup (first time)

1. Clone the repository and enter the directory:

    ```bash
    git clone https://github.com/kir-rescomp/kir-researchcomp-hub.git
    cd kir-researchcomp-hub
    ```

2. Create and activate a Python virtual environment:

    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    ```

3. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

### Previewing your changes

Create a **new** branch, make your edits, then start the development server:

```bash
mkdocs serve
```

The live preview will be available at [http://127.0.0.1:8000/kir-researchcomp-hub/](http://127.0.0.1:8000/kir-researchcomp-hub/). The page reloads automatically as you save changes.

Once you're happy with the result, open a pull request against `main`.
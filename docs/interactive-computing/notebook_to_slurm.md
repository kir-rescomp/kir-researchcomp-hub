# How do I run my Python Notebook through Slurm?

First step is to convert your `.ipynb` (Interactive Python Notebook) file into a regular `.py` python file. There are two ways to do this.

#### 1. nbconvert

`nbconvert` is a tool used to convert notebooks to other formats, it is accessible through the command line if you are logged in through Jupyter.

<div class="nord" markdown=1>
```py
module load JupyterLab/4.5.6-GCCcore-12.3.0
jupyter nbconvert --to script my_notebook.ipynb
```

will create a new python script called **my_notebook.py**.

#### 2. Export Notebook

With your notebook open, select <kbd>File</kbd> -> <kbd>Save</kbd> and <kbd>Export Notebook As...</kbd> -> <kbd>Executable Script</kbd>

>This option might be less convenient as the exporter saves the python file to your local computer, meaning you will have to drag it 
back into the file explorer in Jupyter from your downloads folder.

This script can then be run as a regular python script.
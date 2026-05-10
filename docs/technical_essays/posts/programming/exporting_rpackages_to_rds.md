---
date: 
  created: 2025-12-10
title: Migrating R Packages Between R Versions
categories:
  - Programming
tags:
  - Terminals
  - Bash
---

<div class="dracula" markdown="1">

<p align="center">
    <img src="{{ config.site_url }}assets/images/posts/r_package_export_to_rds.png" alt="r-package-logo" width="350"/>
</p>


When upgrading to a new version of R on the HPC cluster, your existing package library will not automatically carry over. This is by design—R packages are typically compiled for specific R versions and may not be compatible across major version changes. While you could manually reinstall packages one-by-one, this approach provides a systematic way to preserve and recreate your package environment.

The key challenge in HPC environments is that packages often come from different sources—primarily CRAN (the Comprehensive R Archive Network) and Bioconductor (specialized for bioinformatics packages). These repositories have different installation methods and dependency resolution systems, so it's important to track which packages came from where. The approach below separates your packages by source, ensuring they're reinstalled using the correct method.

### Important Considerations

- **Timing**: Run the export step (`my_packages_by_repo.rds` creation) while you still have access to your old R version, before switching to the new version
- **Storage location**: Save the `my_packages_by_repo.rds` file somewhere accessible from your home directory or a shared project space—not in the R library directory itself, which may change between versions
- **Installation time**: Depending on the number of packages and their dependencies, reinstallation can take considerable time. Consider running this in a batch job or interactive session with sufficient time allocation
- **Dependencies**: Some packages may have system-level dependencies that require specific modules to be loaded on the cluster. If installations fail, check that you have the same modules loaded that you used with the previous R version

### Migration Process

Follow these two steps to migrate your packages:

#### Step 1: Export Your Current Package List

In your **current version of R**, run the following to create a record of your installed packages:


```r
# Get all installed packages with their repository info
all_packages <- as.data.frame(installed.packages())

# Remove base packages
all_packages <- all_packages[all_packages$Priority != "base" | is.na(all_packages$Priority), ]

# Separate CRAN vs Bioconductor
bioc_packages <- all_packages[grepl("Bioconductor", all_packages$Repository), "Package"]
cran_packages <- all_packages[grepl("CRAN", all_packages$Repository), "Package"]

# Save both lists
saveRDS(list(cran = cran_packages, bioc = bioc_packages), "my_packages_by_repo.rds")
```
#### Step 2: Reinstall Packages in the New R Version

After switching to the **new version of R** (e.g., by loading a different module), run the following to reinstall your packages:

```r
# Load package lists
pkg_lists <- readRDS("my_packages_by_repo.rds")

# Install CRAN packages
install.packages(pkg_lists$cran)

# Install Bioconductor packages
if (!require("BiocManager", quietly = TRUE))
    install.packages("BiocManager")

BiocManager::install(pkg_lists$bioc)
```

The installation will respect your configured library path (check with `.libPaths()`) and install packages to your personal library directory. CRAN packages are installed first using the standard `install.packages()` function, followed by Bioconductor packages using `BiocManager`, which handles Bioconductor's specific versioning and dependency requirements.


</div>

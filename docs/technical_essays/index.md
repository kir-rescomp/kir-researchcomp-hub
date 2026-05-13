# Technical Essays

Longer-form writing on HPC, scientific computing, and programming — things that
deserve more than a how-to guide but don't belong in the main docs.

---

<div class="essays-section-header" markdown>
:material-server-network: <span>HPC</span>
</div>

<div class="grid cards essays-grid" markdown>

-   **Why Linux on HPC?**

    The practical and historical reasons every serious cluster runs Linux, and
    what that means for researchers moving from Windows or macOS workflows.

    [:octicons-arrow-right-24: Read](./hpc/why_linux_on_hpc.md)


-   **Demystifying Compiler Toolchains**

    Why your HPC software stack depends on GCC versions and what toolchains
    actually do under the hood. Covers the GCCcore–GCC–foss hierarchy and why
    mixing toolchains silently breaks things.

    [:octicons-arrow-right-24: Read](./hpc/demystifying_compiler_toolchains.md)

</div>

<div class="essays-section-header" markdown>
:fontawesome-solid-square-binary: <span>Programming</span>
</div>

<div class="grid cards essays-grid" markdown>

-   **Unit Testing for Scientific Code**

    What is Unit Testing and Why It Matters for Research Software¶


    [:octicons-arrow-right-24: Read](./programming/unit_testing.md)


-   **Migrating R Packages Between Versions**

    Using `.Rprofile` to switch R library paths dynamically depending on module
    environment, so you don't end up with mixed library states across sessions.

    [:octicons-arrow-right-24: Read](./programming/exporting_rpackages_to_rds.md)

- **Version Control with Git - A Technical Primer**

    Understanding the core concepts of Git version control

    [:octicons-arrow-right-24: Read](./programming/vc_git_Technical_primer.md)

-   **SSH on Ghostty**

    Getting Ghostty's terminfo and italics working correctly over SSH to remote
    HPC login nodes, without corrupting your remote `TERM` environment.

    [:octicons-arrow-right-24: Read](./programming/ssh_on_ghostty.md)



</div>
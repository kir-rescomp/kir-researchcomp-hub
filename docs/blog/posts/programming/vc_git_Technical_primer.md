---
date: 
  created: 2025-11-29
title: Version Control with Git -  A Technical Primer
categories:
  - Version Control
tags:
  - Git
---

<div class="dracula" markdown="1">
 
<p align="center">
    <img src="{{ config.site_url }}assets/images/posts/git_technical_primer_logo.png" alt="git-page_logo" width="300">
</p>

!!! circle-info-2 ""
    If you’d like more information or hands-on training on Git and GitHub, please refer to this [Introduction to Git and Github](https://kir-rescomp.github.io/training-intro-to-git-github/) on KIR Training Catalogue

Version control is the practice of tracking and managing changes to code over time. Git, created by Linus Torvalds in 2005, has become the dominant distributed version control system in software development.

## Core Concepts

At its heart, Git maintains a directed acyclic graph (DAG) of commits. Each commit is a snapshot of your project at a specific point in time, identified by a SHA-1 hash. Unlike centralized systems like SVN, Git is distributed—every developer has a complete copy of the repository history.

The fundamental workflow involves three areas:

- **Working directory**: Your current files
- **Staging area (index)**: Changes marked for the next commit
- **Repository**: Committed snapshots

This staging area is Git's distinguishing feature, allowing you to craft precise commits by selectively adding changes.

## Branching and Merging

Git's lightweight branching model is revolutionary. A branch is simply a movable pointer to a commit. Creating, switching, and merging branches is fast and cheap, encouraging workflows like feature branches and GitFlow.

When merging, Git performs a three-way merge using the common ancestor of both branches. Conflicts arise when the same lines are modified differently, requiring manual resolution.

## Practical Operations

Common operations include:

- `git init` or `git clone` to start
- `git add` to stage changes
- `git commit` to snapshot
- `git push/pull` to sync with remotes
- `git branch` and `git merge` for parallel development



Advanced features like rebase, cherry-pick, and interactive staging enable powerful history manipulation.

## Why Git Matters

Git enables collaborative development at scale. It provides complete history, enables experimentation through branching, and allows offline work. The GitHub/GitLab ecosystem built atop Git has transformed how software is developed and shared.

Understanding Git's content-addressable storage model and object database—where blobs, trees, commits, and tags form the foundation—unlocks mastery of this essential tool.

</div>

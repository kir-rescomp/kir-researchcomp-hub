---
date: 
  created: 2025-12-10
title: Fixing Ghostty Backspace Behaviour Over SSH
categories:
  - Programming
tags:
  - Terminals
  - Bash
---

<div class="dracula" markdown="1">

<p align="center">
  <img src="{{ config.site_url }}assets/images/posts/ghostty_backspace_issue.png" alt="unit-test-logo" width="350"/>
</p>>

If you've recently switched to [Ghostty](https://ghostty.org/) and noticed that backspace doesn't work properly when SSH'ing into remote servers, you're not alone. Instead of deleting characters, pressing backspace might move the cursor around or print control characters like `^?` or `^H`. This post explains why this happens and how to fix it.

## The Problem

When you SSH into a remote server from Ghostty, the backspace key may not delete characters as expected. This is frustrating when you're trying to edit commands on the remote shell, as each backspace press either does nothing or produces unexpected behaviour.

## Why This Happens

The issue boils down to a mismatch between what Ghostty sends when you press backspace and what the remote shell expects to receive.

When you establish an SSH connection, the remote shell needs to know certain things about your terminal:

- What type of terminal you're using (the `TERM` environment variable)
- What character code to treat as "erase" (configured via `stty`)
- Various other terminal capabilities and key sequences

By default, SSH sessions inherit only a basic environment. The remote server doesn't automatically know about Ghostty's preferred terminal settings, including what byte sequence Ghostty sends for backspace. Without this information, the remote shell's line editing configuration (`stty erase`) doesn't match what Ghostty is actually sending, resulting in the backspace misbehaviour.

## The Solution

Ghostty provides a shell integration feature specifically designed to address this. Add the following line to your Ghostty configuration file at `~/.config/ghostty/config`:

```py
shell-integration-features = ssh-env
```

This setting instructs Ghostty to export a richer, Ghostty-aware environment when you initiate SSH connections. The remote server will then receive the correct `TERM` value and related variables, allowing it to configure its line editing to match what Ghostty actually sends for backspace and other special keys.

### Complete Example Configuration

Here's a more complete Ghostty configuration including the SSH environment fix and some other useful settings:

```py
font-family = FiraCode Nerd Font Mono SemBd
font-size = 11
background-opacity = 0.85
keybind = ctrl+v=paste_from_clipboard
shell-integration-features = ssh-env
```

## The Zellij Complication

If you use [Zellij](https://zellij.dev/) (a terminal multiplexer) with Ghostty, you'll encounter an additional layer of complexity.

### Why Zellij Changes Things

When Zellij is running, your keystrokes follow this path:

```py
Ghostty → Zellij → SSH → Remote Shell
```

Zellij acts as an intermediary terminal layer with its own ideas about terminal compatibility and key handling. From the remote host's perspective, it's no longer talking directly to Ghostty—instead, it sees whatever `TERM` and terminal behaviour Zellij presents.

This means that while `shell-integration-features = ssh-env` solves the problem for direct SSH connections from Ghostty, it doesn't help when Zellij is in the middle. The remote server needs different terminal metadata when accessed through Zellij.

### The Additional Fix for Zellij

To make backspace work correctly when SSH'ing from within Zellij, you need to configure SSH to send explicit terminal information. Add the following to your SSH host configuration in `~/.ssh/config`:

```py
Host your-remote-host
    SendEnv TERM
    SetEnv TERM=xterm-256color
```

These directives ensure that:

1. `SendEnv TERM` tells SSH to send the `TERM` environment variable to the remote host
2. `SetEnv TERM=xterm-256color` explicitly sets a widely-compatible terminal type

This configuration works around the Zellij layer by forcing consistent terminal metadata that the remote host can understand and configure appropriately.

### Wildcard Configuration

If you want this fix to apply to all your SSH connections, you can use a wildcard:

```py
Host *
    SendEnv TERM
    SetEnv TERM=xterm-256color
```

## Summary

- **Direct SSH from Ghostty**: Enable `shell-integration-features = ssh-env` in Ghostty's config
- **SSH from Zellij in Ghostty**: Additionally configure `~/.ssh/config` to explicitly set and send the `TERM` variable

With both configurations in place, your backspace key should work reliably whether you're SSH'ing directly from Ghostty or from within a Zellij session.

</div>
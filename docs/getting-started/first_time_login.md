---
title: Accessing the cluster
description: Ways to connect to the BMRC cluster
published: true
date: 2025-11-20T12:36:16.492Z
tags: access, two-factor authentication, tmux, screen, terminal multiplexer
editor: markdown
dateCreated: 2021-08-20T13:18:06.993Z
---

# Connecting to the cluster

<p align="center" style="margin-bottom: -1px;">
    <img src="../../assets/images/material/getting-started/ssh_process.png" alt="data-transfer-cli" width="700" style="opacity: 0.9;"/>
</p>

## Local Access

To connect to the BMRC cluster, while connected to a local wired network at the Kennedy Institute or `eduroam`, run the following command replacing `username` with your username for the cluster in your local computer terminal. You can connect to either `cluster1`, `cluster2` , `cluster3` or `cluster4` by changing the command accordingly: 

<div class="nord" markdown="1">
```py
ssh username@cluster1.bmrc.ox.ac.uk
```

## First Time Login  - Setting a New Cluster Password

On your first login to the BMRC cluster, you will be required to replace your temporary password with a new cluster password.

!!! info "Before you begin"
    This guide assumes that:

    - You have received a **temporary password** by email from the KIR Research Computing Manager.
    - You have set up **two-factor authentication (2FA)** by scanning the QR code provided by the KIR Research Computing Manager. Any authenticator app may be used (e.g. Microsoft Authenticator, Authy, Google Authenticator).

### Connecting to the cluster

Open a terminal and run the following command, replacing `bmrcusername` with your BMRC username:

```bash
ssh bmrcusername@cluster1.bmrc.ox.ac.uk
```

The password reset then follows a three-step process.

### Step 1 – Authenticate with your temporary password

You will be prompted for two factors:

| Prompt | What to enter |
|---|---|
| `First Factor` | The temporary password sent to you by email. Copying and pasting it is recommended. |
| `Second Factor` | The current six-digit token from your 2FA app, without spaces. |

### Step 2 – Confirm your current password

You will see a message stating that your password has expired, followed by these prompts:

| Prompt | What to enter |
|---|---|
| `Current Password` | The same temporary password used in Step 1. |
| `Second Factor` | A **new** six-digit token from your 2FA app. |

!!! warning "Wait for a new token"
    Before completing the `Second Factor` prompt in Step 2, wait until your 2FA app displays a **new** six-digit token. Re-entering the token used in Step 1 will cause the password reset to fail.

### Step 3 – Set your new password

You will be prompted to enter your `New Password` and then to confirm it.

The new password must meet the same requirements as your University SSO password:

- At least 16 characters
- At least one upper-case letter
- At least one lower-case letter
- At least one digit
- At least one special character

!!! tip
    No characters are displayed while you type a password. This is expected behaviour.

### If the password reset fails

If the reset is unsuccessful, the process returns to **Step 1**, and you will need to repeat Steps 1 to 3.

The two most common causes of a failed reset are:

1. Entering the **same six-digit token** at the `Second Factor` prompt in both Step 1 and Step 2.
2. A **mismatch** between the new password and its confirmation entry.

### Successful login

Once your password has been changed successfully, you will be logged into the `cluster1` login node, and your terminal prompt will change to show your username and the node name, for example:

```text
[bmrcusername@cluster1 ~]$
```

Use your new cluster password, together with a 2FA token, for all future logins.

#### Recommended Terminal Setup

1. In a new **local** terminal run; `mkdir -p ~/.ssh/sockets` this will create a subdirectory in your home directory to store socket configurations.

2. Open your ssh config file (e.g. `nano ~/.ssh/config` to open with the text editor `nano`) and add the following 
!!! exclamation "Make sure to replace `username` with your BMRC Username in all four places"


```py
Host *
    ControlMaster auto
    ControlPath ~/.ssh/sockets/ssh_mux_%h_%p_%r
    ControlPersist 1
  
Host bmrc1
     User username
     hostname cluster1.bmrc.ox.ac.uk
     ForwardAgent yes
     ForwardX11Trusted yes
     ControlMaster auto
     ControlPath ~/.ssh/sockets/ssh-socket-%r-%h-%p
     ControlPersist 24h
     ServerAliveInterval 300
     ServerAliveCountMax 2

Host bmrc2
     User username
     hostname cluster2.bmrc.ox.ac.uk
     ForwardAgent yes
     ForwardX11Trusted yes
     ControlMaster auto
     ControlPath ~/.ssh/sockets/ssh-socket-%r-%h-%p
     ControlPersist 24h
     ServerAliveInterval 300
     ServerAliveCountMax 2

Host bmrc3
     User username
     hostname cluster3.bmrc.ox.ac.uk
     ForwardAgent yes
     ForwardX11Trusted yes
     ControlMaster auto
     ControlPath ~/.ssh/sockets/ssh-socket-%r-%h-%p
     ControlPersist 24h
     ServerAliveInterval 300
     ServerAliveCountMax 2
 
Host bmrc4
     User username
     hostname cluster4.bmrc.ox.ac.uk
     ForwardAgent yes
     ForwardX11Trusted yes
     ControlMaster auto
     ControlPath ~/.ssh/sockets/ssh-socket-%r-%h-%p
     ControlPersist 24h
     ServerAliveInterval 300
     ServerAliveCountMax 2
```
3. Ensure the permissions are correct by running 

```py
chmod 600 ~/.ssh/config
```
4. Now you can connect login node of interest with the aliases such as `bmrc1` , `bmrc2`, etc. For an example, if you wanto to connec to `cluster1.bmrc.ox.ac.uk` which is `bmrc1`, execute  

```py
ssh bmrc1
```


## Remote Access

For remote connections (when away from the University), you will need to connect to Oxford VPN (**vpn.ox.ac.uk**) OR one of the MSD vpns

## Two-factor authentication

The BMRC cluster employs two-factor authentication. After your account has been created and you have received a welcome email, we will arrange an induction session where we will set up your two-factor authentication. For two-factor authentication you can use one of available smartphone apps (for example, Microsoft or Google Authenticator) or one of the supported authenticator applications, that can be run on a local computer. 

More information on available methods can be found [here](https://help.it.ox.ac.uk/how-to-use-mfa). 


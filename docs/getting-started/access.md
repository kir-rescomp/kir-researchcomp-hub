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

## Local Access

To connect to the BMRC cluster, while connected to a local wired network at the Kennedy Institute or Eduroam, run the following command replacing `username` with your username for the cluster in your local computer terminal. You can connect to either `cluster1`, `cluster2` , `cluster3` or `cluster4` by changing the command accordingly: 

<div class="nord" markdown="1">
```py
ssh username@cluster1.bmrc.ox.ac.uk
```
#### Recommended Terminal Setup

1. In a new **local** terminal run; `mkdir -p ~/.ssh/sockets` this will create a subdirectory in your home directory to store socket configurations.

2. Open your ssh config file (e.g. `nano ~/.ssh/config` to open with the text editor `nano`) and add the following (replacing username with your username):


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

For remote connections (when away from the University), you will need to connect to University VPN  (such as MSD IT VPN) before running the command in your local computer's terminal: 


## Two-factor authentication

The BMRC cluster employs two-factor authentication. After your account has been created and you have received a welcome email, we will arrange an induction session where we will set up your two-factor authentication. For two-factor authentication you can use one of available smartphone apps (for example, Microsoft or Google Authenticator) or one of the supported authenticator applications, that can be run on a local computer. 

More information on available methods can be found [here](https://help.it.ox.ac.uk/how-to-use-mfa). 

## Terminal multiplexer

After logging in to the cluster, it is recommended to start a terminal multiplexer, a software that allows creating and working in multiple terminal windows in the same single ssh session. There are two terminal multiplexers, `tmux` and `screen` on the cluster. To start a multiplexer session, run, for example:

```py
tmux
```

Using a multiplexer has an advantage that if your ssh connection to the cluster breaks down or disconnects because of ssh session timeout, the mulitplexer session continues to run in the background. You can simply reconnect to the running multiplexer session after opening ssh connection to the cluster again. 

```py
tmux attach
```

Both tmux and screen have a wide range of options and commands to manage terminal and multiplexer sessions. 

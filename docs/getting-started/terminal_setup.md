# Recommended Terminal Setup

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
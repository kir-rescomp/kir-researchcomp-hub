# Download CosMx Data directly to BMRC from AtoMx Server

!!! circle-info "Note"
    - You will need an AtoMx Platform account to download this data. Discuss the account details with KIR Spatial/SingleCell SRF Manager/s
    - Highly recommend using a [`tmux`](../interactive-computing/tmux.md) session for this download as it can from few minutes to hours

<div class="nord" markdown="1">

* Replace `/Remote_Directory_Name` with the directory name on AtoMx export panel. Make sure to include leading slash `/` 
* Replace `/path/in/bmrc/filesystem/` with the path BMRC. Make sure to include trailing slash 
* When you execute the following command block with the adjusted paths, it will prompt for AtoMx `Password:`

```py
module load lftp

lftp -u username@kennedy.ox.ac.uk sftp://eu.export.atomx.nanostring.eu -e "
set sftp:connect-program 'ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password -a -x';
set net:timeout 30;
set net:max-retries 5;
set net:reconnect-interval-base 5;
mirror -c --verbose --use-pget-n=3 /Remote_Directory_Name /path/in/bmrc/filesystem/;
bye"
```
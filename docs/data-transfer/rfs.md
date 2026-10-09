# Accessing RFS from the cluster

The `RFS` module provides a simple command-line interface for accessing the Research File Service (RFS) from the cluster.

It uses `smbclient` internally, but common operations such as listing files, uploading data, downloading data, and transferring directories are exposed through the simpler `rfs` command.

## Load the module

Load the module before using RFS:

<div class="nord" markdown="1">
```py
module load RFS
```

You can view the available commands at any time with:

```py
rfs -h
```

## Authentication

There are three ways to authenticate to RFS.

=== "1. Temporary authentication"

    For most interactive use, the recommended method is:

    ```py
    rfs auth
    ```

    You will be prompted for your RFS/CONNECT username and password.

    The credentials are cached temporarily for the current user, allowing subsequent `rfs` commands to run without repeatedly asking for your password:

    ```py
    rfs auth
    rfs ls
    rfs put results.csv MYPROJECT/results
    rfs get MYPROJECT/data.csv
    ```

    The temporary credentials expire automatically after a limited period.

    To remove them immediately, run:

    ```py
    rfs logout
    ```

    `rfs logout` removes only the temporary credentials created by `rfs auth`. It does not remove any permanent credentials file you may have created.

=== "2. Store credentials in your home directory"

    If you regularly access RFS, you can create:

    ```py
    ~/.rfs_credentials
    ```

    with the following contents:

    ```py
    username = your_username
    password = your_password
    domain = AD-OAK
    ```

    The file must only be readable by you:

    ```py
    chmod 600 ~/.rfs_credentials
    ```

    When this file exists, `rfs` can use it automatically without prompting for a password.

    Because this file contains your password in plain text, use this method only if you are comfortable storing credentials in your home directory.

=== "3. Prompt for each command"

    If you do not want credentials to be stored or temporarily cached, use:
    
    ```py
    rfs --prompt ls
    ```
    
    or, for example:
    
    ```py
    rfs --prompt put results.csv MYPROJECT
    ```
    
    You will be asked for your password for that command only.
    
    The password is not retained for subsequent commands.

## Listing files and directories

List the root of RFS:

```py
rfs ls
```

List a specific directory:

```py
rfs ls MYPROJECT
```

or:

```py
rfs ls MYPROJECT/data
```

`list` is also accepted as an alias for `ls`.

## Creating directories

Create a directory on RFS with:

```py
rfs mkdir MYPROJECT/results
```

## Uploading files

Upload a file to the RFS root:

```py
rfs put results.csv
```

Upload it to a specific remote directory:

```py
rfs put results.csv MYPROJECT/results
```

`push` is also accepted as an alias for `put`.

## Uploading directories

Directories are detected automatically when uploading.

For example:

```py
rfs put results MYPROJECT
```

uploads the local `results` directory and its contents into `MYPROJECT`.

You can also explicitly request recursive transfer with:

```py
rfs put -r results MYPROJECT
```

The `rfs` command automatically enables the required recursive `smbclient` options.

## Downloading files

Download a remote file into the current directory:

```py
rfs get MYPROJECT/results.csv
```

Download it into a specific local directory:

```py
rfs get MYPROJECT/results.csv /scratch/$USER
```

`fetch` is also accepted as an alias for `get`.

## Downloading directories

Use `-r` when downloading an entire remote directory:

```py
rfs get -r MYPROJECT/results /scratch/$USER
```

This downloads the directory and its contents recursively.

## Typical workflow

For an interactive session:

```py
module load RFS

rfs auth

rfs ls MYPROJECT

rfs get -r MYPROJECT/input /scratch/$USER

# Run your analysis...

rfs put results MYPROJECT/output

rfs logout
```

## Authentication summary

| Method | Command / file | Credentials retained? | Typical use |
| --- | --- | --- | --- |
| Temporary cache | `rfs auth` | Temporarily | Recommended for interactive use |
| Credentials file | `~/.rfs_credentials` | Yes | Frequent or automated access |
| Prompt each time | `rfs --prompt ...` | No | Users who do not want credentials retained |

For a full list of available commands and options, run:

```py
rfs -h
```
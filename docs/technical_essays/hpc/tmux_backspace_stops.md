# When Backspace Stops Working Inside tmux

## Symptom

A user starts a `tmux` session, types a command, and presses <kbd>Backspace</kbd>. Instead of
deleting the character to the left, the cursor moves *forward*. Outside tmux — on the plain
login shell — backspace behaves perfectly.

The failure is often client-specific: macOS Terminal.app and Tabby users hit it while
Ghostty or a native Linux terminal on the same cluster do not.


## What Actually Causes It

tmux does not pass the outer terminal's `TERM` through to programs running inside a pane.
It sets its own, controlled by the `default-terminal` option — typically
`tmux-256color` or `screen-256color`.

Everything inside the pane (your shell's readline line editor, `vim`, `less`) then looks up
that `TERM` name in the **terminfo database** to learn how the terminal behaves — including
which byte the erase key sends and what capability erases a character.

If the terminfo entry for that name **does not exist on the machine**, the lookup fails.
Programs fall back to built-in defaults, and those defaults frequently disagree with what the
client actually sends. macOS terminals send `DEL` (`0x7f`, shown as `^?`) for backspace, while
the fallback assumes `BS` (`0x08`, `^H`) — or the reverse. The result is a keypress that is
received but interpreted as something other than "erase".

This is why the bug appears only inside tmux: outside tmux, `TERM` is whatever the client set
(`xterm-256color`), which is present on essentially every system. Inside tmux, `TERM` becomes
`tmux-256color`, which is **not** shipped by default on many minimal HPC node images.


### Confirming the diagnosis

Inside a broken session:

<div class="nord" markdown="1">
```py
echo $TERM
infocmp $TERM >/dev/null 2>&1 && echo "resolves" || echo "MISSING - this is the bug"
```


If `TERM` looks correct but `infocmp` reports missing, the terminfo entry is the problem.

A second, independent check — run `cat -v`, press <kbd>Backspace</kbd>, then <kbd>Ctrl-C</kbd>,
both inside and outside tmux:

- `^?` means the key sends `DEL` (`0x7f`)
- `^H` means it sends `BS` (`0x08`)

If the two contexts differ, or if `^?` is sent but nothing erases, you are looking at the same
root cause.

!!! circle-info ""
    setting `set -g default-terminal "tmux-256color"` in `~/.tmux.conf` when the entry is  missing makes things *worse*, not better — tmux advertises a `TERM` that cannot be resolved. Fix the database first, then set the option."

## Case 1: tmux Installed at the OS Level

You do not have write access to `/usr/share/terminfo`, but you do not need it. ncurses searches
`~/.terminfo` before the system database, so a per-user entry is enough.

### Option A — install the missing terminfo entry (preferred)

On any machine that *does* have the entry (your laptop, an Ubuntu workstation), dump it:

```py
infocmp -x tmux-256color > tmux-256color.terminfo
```

Copy that file to the cluster, then compile it into your home directory:

```py
tic -x tmux-256color.terminfo
```

With no `-o` and no `TERMINFO` set, `tic` writes to `~/.terminfo/t/tmux-256color` automatically.
Verify:

```py
infocmp tmux-256color >/dev/null 2>&1 && echo ok
```

Then restart the server so the change takes effect — reattaching to an existing session is not
enough, because the old server already fixed its environment:

```py
tmux kill-server
tmux
```

### Option B — fall back to a terminal type that already exists

`screen-256color` predates `tmux-256color` and is present almost everywhere. Check first:

```py
infocmp screen-256color >/dev/null 2>&1 && echo exists || echo missing
```

If it exists, put this in `~/.tmux.conf`:

```py
set -g default-terminal "screen-256color"
```

Then `tmux kill-server` and reconnect. You lose a few tmux-specific capabilities (notably
italics support), but backspace works and no file copying is required.

### Option C — if the key itself is misconfigured

If `infocmp $TERM` resolves fine and backspace still misbehaves, the client is sending the wrong
byte. Two places to look:

```py
stty erase '^?'
```

in your shell rc, and — for Tabby users — **Settings → Terminal → "Backspace sends"**, which
should be set to `^?` / Delete rather than `^H`.


## Case 2: tmux Is a Local or Shared Build

When you have compiled tmux yourself into a project directory, fix it once in the install prefix
so every user inherits the fix, instead of asking each person to populate their own
`~/.terminfo`.

### Step 1 — compile the entry into the install prefix

Obtain `tmux-256color.terminfo` as above, then:

```py
mkdir -p /path/to/tmux-3.7b/share/terminfo
TERMINFO=/path/to/tmux-3.7b/share/terminfo tic -x tmux-256color.terminfo
```

**Use `TERMINFO=`, not `-o`.** On some ncurses builds `tic -o <dir>` is silently ignored: the
command exits `0`, prints nothing, and writes to `~/.terminfo` anyway. Setting the `TERMINFO`
environment variable is honoured reliably.

Confirm the file landed where you intended:

```py
ls /path/to/tmux-3.7b/share/terminfo/t/
# tmux-256color
```

### Step 2 — point users' ncurses at that directory

Programs only search `~/.terminfo`, `$TERMINFO`, and the compiled-in default unless
`TERMINFO_DIRS` says otherwise.


**If users source a shared shell config**, add the export next to the existing `PATH` line:

```bash
export PATH="/path/to/tmux-3.7b/bin:$PATH"
export TERMINFO_DIRS="/path/to/tmux-3.7b/share/terminfo:"
```

The **trailing colon is deliberate**. `TERMINFO_DIRS` is colon-separated, and an *empty* entry
means "the compiled-in default search path". Ending with `:` therefore appends the system
database without hardcoding `/usr/share/terminfo`, which may not be the correct path on every
node image.

If you prefer to be explicit and preserve any pre-existing value:

```py
export TERMINFO_DIRS="/path/to/tmux-3.7b/share/terminfo:${TERMINFO_DIRS:-/usr/share/terminfo}"
```

Two things to remember whichever route you take: **restart the tmux server** (`tmux kill-server`)
rather than reattaching, and **check `infocmp $TERM` before changing `default-terminal`** — that
one command distinguishes a missing database entry from a genuine key-encoding problem, and they
have entirely different fixes.
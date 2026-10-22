---
title: Linux Background Jobs
date: 2026-10-22
excerpt: Background Jobs & systemd: A Practical Guide
---

# Background Jobs & systemd: A Practical Guide

## Why this matters

A process launched with `&` works perfectly until the terminal closes. A script wrapped in `nohup` runs fine until it hangs on a network call and nothing restarts it. Neither tool reports anything when it fails.

Two distinct problems are being solved here:

1. **Running something in the background** — a shell-level concern, handled by job control.
2. **Managing a long-lived service** — a system-level concern, handled by an init system.

Mixing them up causes most of the operational surprises people hit with background processes. This article covers both, starting from the primitives so the behavior of the higher-level tools makes sense, then spending most of its length on `systemctl`, which is what manages services on virtually every modern Linux distribution.

---

# Part 1 — Job Control: The Fundamentals

## 1.1 The `&` operator

Append `&` to run a command in the background:

```bash
sleep 300 &
```

```
[1] 48213
```

Two different identifiers:

- `[1]` — the **job number**, assigned by the current shell. Local to that shell session; a new terminal starts again at `[1]`.
- `48213` — the **PID**, assigned by the kernel. Global.

A *job* is a shell concept. A *process* is a kernel concept. `jobs`, `fg`, and `bg` operate on jobs; `kill` and `ps` operate on PIDs. Both matter.

What happens on terminal close: the kernel sends `SIGHUP` to the shell, and the shell forwards `SIGHUP` to its jobs. A background process started with `&` receives it and terminates unless it ignores the signal — which is precisely what `nohup` arranges.

## 1.2 `jobs` — the job list

```bash
jobs
```

```
[1]+  Running                 sleep 300 &
[2]-  Stopped                 vim notes.txt
```

- `+` marks the most recently manipulated job — the default target for `fg` and `bg`.
- `-` marks the second most recent.
- States: `Running`, `Stopped`, `Done`, `Terminated`.

`jobs -l` adds PIDs. `jobs -r` shows running jobs only, `jobs -s` stopped only.

`jobs` only lists jobs belonging to the current shell. Other terminals and other SSH sessions each maintain their own lists.

## 1.3 Ctrl-Z, `bg`, `fg` — suspend and resume

A workflow worth committing to memory:

```bash
$ vim notes.txt
# press Ctrl-Z
[1]+  Stopped                 vim notes.txt

$ bg
[1]+ vim notes.txt &

$ fg
```

- **Ctrl-Z** sends `SIGTSTP`, suspending the process. It is frozen, not terminated; memory and file descriptors are retained.
- **`bg`** sends `SIGCONT` and resumes the job in the background. A background job that tries to read from the terminal receives `SIGTTIN` and stops again.
- **`fg`** brings a job to the foreground. `fg %2` targets a specific job.

A stopped job still holds its resources — database connections, lock files, memory. A stopped `rsync` has not finished; it is paused. If `jobs` doesn't show what you expect, check `ps aux | grep <name>`, since the process may belong to a different shell.

## 1.4 `disown` — detach from the job table

For a process already started with `&` that should outlive the shell:

```bash
long_task.sh &
disown %1
```

Removing it from the job table means it won't receive the shell's exit `SIGHUP`. `disown -h %1` marks it to ignore `SIGHUP` while keeping it visible in `jobs`.

This is a retroactive fix. When the intent is known upfront, `nohup` expresses it directly.

## 1.5 `nohup` — survive the hangup

```bash
nohup ./long-task.sh > out.log 2>&1 &
```

What it does:

1. Sets the process to ignore `SIGHUP`.
2. If stdout is a terminal, redirects it to `nohup.out` — hence the explicit redirect above, since `nohup.out` otherwise grows without bound.
3. Adds nothing else. The trailing `&` is still required to return the prompt.

What it does not do:

- Detach the process from the session in a way that survives every terminal change.
- Restart it if it crashes.
- Start it after a reboot.
- Provide logging, retries, or any visibility into failures.

`nohup` solves exactly one problem — the hangup. It is appropriate for a single one-off command whose completion nobody needs to monitor. Anything long-lived belongs in Part 2.

## 1.6 Summary of Part 1

| Need | Command |
|---|---|
| Run in background, terminal open | `cmd &` |
| List background jobs | `jobs -l` |
| Bring job to foreground | `fg %1` |
| Resume stopped job in background | `bg %1` |
| Suspend the foreground job | `Ctrl-Z` |
| Make a job survive shell exit | `nohup cmd &` or `disown %1` |
| Long-lived, supervised, logged | systemd unit (Part 2) |

---

# Part 2 — systemd: Managing Services

## 2.1 What systemd is

systemd is the init system and service manager for most modern distributions (Ubuntu, Debian, Fedora, RHEL, Arch). It starts as PID 1 at boot and is responsible for:

- Starting and stopping **services** (daemons).
- Managing **schedules** (timers, the modern cron replacement).
- Managing **sockets** (starting services on first connection).
- Collecting **logs** (journald).
- Applying **sandboxing** to services.

`systemctl` is the control interface; `journalctl` reads its logs.

Every Laravel, Django, Node, and Rails application deployed in the last decade has run its queue workers and schedulers as systemd units. The reason is practical: it's already installed on the host, it captures logs by default, and it restarts processes that die.

## 2.2 Units

Everything systemd manages is a **unit**. The types that matter in practice:

| Type | Extension | Purpose |
|---|---|---|
| **Service** | `.service` | A daemon or process |
| **Timer** | `.timer` | A scheduled trigger |
| **Target** | `.target` | A group of units |
| **Socket** | `.socket` | Starts a service on connection |
| **Path** | `.path` | Starts a service on file change |

### Where unit files live

| Path | Purpose |
|---|---|
| `/usr/lib/systemd/system/` | Package-provided units — never edit these |
| `/etc/systemd/system/` | Local units and overrides, higher precedence |
| `~/.config/systemd/user/` | User units, run via `systemctl --user` |

Package-provided files in `/usr/lib` are overwritten on upgrade. Custom units and drop-ins belong in `/etc`.

## 2.3 Everyday commands

```bash
systemctl status nginx
```

```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2024-05-13 09:12:04 UTC; 3 days ago
   Main PID: 998 (nginx)
     Memory: 6.2M
     CGroup: /system.slice/nginx.service
             ├─998 "nginx: master process /usr/sbin/nginx"
             └─1003 "nginx: worker process"
```

Reading `Loaded:`:

- `enabled` — starts at boot.
- `disabled` — does not start at boot, but can be started manually.
- `masked` — cannot start at all, including manually.
- `static` — no `[Install]` section; started by another unit.
- `failed` — the last run failed; investigate with `journalctl -u`.

Reading `Active:`:

- `active (running)` — running.
- `active (exited)` — `ExecStart` ran once and exited successfully. Normal for `Type=oneshot`.
- `inactive (dead)` — not running.
- `failed` — exited non-zero or crashed.

### Command set

```bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl reload-or-restart nginx
```

`reload` versus `restart`: `reload` sends `SIGHUP` (or runs `ExecReload`) so the service re-reads configuration while keeping existing connections open. `restart` terminates every in-flight request. For nginx and php-fpm, `reload` is the correct choice during deploys.

```bash
sudo systemctl enable nginx
sudo systemctl disable nginx
sudo systemctl enable --now nginx
sudo systemctl disable --now nginx
```

`--now` combines the enable/disable with start/stop.

### `mask` versus `disable`

`disable` removes the boot symlink but leaves the unit startable manually or as a dependency. `mask` symlinks the unit to `/dev/null`, making it unstartable by any means until unmasked.

```bash
sudo systemctl mask bluetooth.service
sudo systemctl unmask bluetooth.service
```

Use `mask` when a service must be prevented from starting under any circumstance.

## 2.4 Writing a service unit

A queue worker, as a concrete example. `/etc/systemd/system/laravel-queue.service`:

```ini
[Unit]
Description=Laravel Queue Worker
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --timeout=120
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### `[Unit]` — metadata and ordering

- **`Description=`** — shown in `systemctl status` and `journalctl`.
- **`After=`** — ordering only. If MySQL fails, this unit still starts.
- **`Wants=`** — soft dependency; start that unit too, ignore its failure.
- **`Requires=`** — hard dependency; this unit fails if that one fails.

`After=` controls order. `Wants=` and `Requires=` control dependencies. They are independent: `After=mysql.service` with `Requires=mysql.service` means "wait for MySQL, and fail if it can't start."

### `[Service]` — how to run it

- **`Type=simple`** — default. `ExecStart` runs in the foreground and systemd tracks it until exit. Correct for `queue:work`, Node, Octane.
- **`Type=oneshot`** — the command runs once and exits. Used for schedulers and setup tasks. `RemainAfterExit=yes` keeps the unit in `active (exited)` after completion.
- **`Type=forking`** — the process forks and the parent exits; systemd tracks the child. Common for nginx and php-fpm.
- **`User=` / `Group=`** — the account to run as. Service accounts should have only the permissions the service needs.
- **`WorkingDirectory=`** — the working directory for `ExecStart`. For Laravel this must be the application root.
- **`ExecStart=`** — the command. systemd does not invoke a shell, so `~`, `$VAR`, pipes, and redirections are not interpreted. Use absolute paths; wrap in `bash -c '...'` when shell features are genuinely required.
- **`Restart=`** — `always` restarts on any exit; `on-failure` only on non-zero exit; `no` is the default. Queue workers use `always`; one-shot schedulers use `no`.
- **`RestartSec=`** — delay before restarting, preventing a crash loop from consuming CPU.

### `[Install]` — boot behavior

- **`WantedBy=multi-user.target`** — pulling this unit in when the system reaches multi-user mode. This is what `enable` acts on. Without an `[Install]` section the unit is `static` and must be started by another unit.

### Bringing it up

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now laravel-queue.service
sudo systemctl status laravel-queue.service
sudo journalctl -u laravel-queue.service -f
```

`daemon-reload` is required after any edit to a unit file. systemd caches unit definitions; without a reload, the edited file is ignored and the previous version continues to be used. This is the most common reason an edit appears to have no effect.

## 2.5 Logs with `journalctl`

Unit files do not redirect output. systemd captures stdout and stderr, and `journalctl` reads them.

```bash
journalctl -u laravel-queue.service
journalctl -u laravel-queue.service -f
journalctl -u laravel-queue.service --since "1 hour ago"
journalctl -u laravel-queue.service -n 100
journalctl -u laravel-queue.service -p err
journalctl --user -u mytask.service
journalctl --since today -u nginx -u php8.2-fpm
```

journald retention is governed by `/etc/systemd/journald.conf`. Default limits can be small; on a production host, raise `SystemMaxUse=` and set `Storage=persistent` so logs survive reboots. For compliance or long-term analysis, ship logs to a dedicated destination rather than relying on journald alone.

Laravel additionally writes to `storage/logs/laravel.log`. `journalctl` shows what the worker printed to stdout and stderr; both locations are worth checking.

## 2.6 Timers

Timers replace cron and offer:

- **Catch-up for missed runs** via `Persistent=true`.
- **Dependencies** — a task can require the database.
- **Logging** through `journalctl -u`.
- **Explicit environment** — the user and working directory are declared, not inherited.

The Laravel scheduler is the canonical case.

### Step 1 — the service

`/etc/systemd/system/laravel-schedule.service`:

```ini
[Unit]
Description=Laravel Scheduler Run
After=network.target mysql.service

[Service]
Type=oneshot
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/php artisan schedule:run
```

`Type=oneshot` matches the behavior: `schedule:run` dispatches due tasks and exits.

### Step 2 — the timer

`/etc/systemd/system/laravel-schedule.timer`:

```ini
[Unit]
Description=Run Laravel Scheduler Every Minute

[Timer]
OnCalendar=*:*:00
Persistent=true

[Install]
WantedBy=timers.target
```

- **`OnCalendar=*:*:00`** — every minute at second zero. Verify any calendar expression with `systemd-analyze calendar "*:*:00"`.
- **`Persistent=true`** — if the host was off during a scheduled tick, run once on the next boot. This is the main advantage over cron.
- **`WantedBy=timers.target`** — what `enable` acts on.

Other common triggers:

```ini
OnBootSec=5min
OnUnitActiveSec=15min
OnCalendar=Mon..Fri 09:00
OnCalendar=*-*-* 02:00:00
```

### Step 3 — enable the timer

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now laravel-schedule.timer

systemctl list-timers --all
journalctl -u laravel-schedule.service -n 20
```

Enabling the `.service` instead of the `.timer` causes it to run once at boot and never again — the timer is the scheduling component. When a timer fails to fire, `systemctl list-timers` shows the next scheduled run and `journalctl -u <name>.service` shows whether the service itself ran.

## 2.7 Grouping services with targets

With several units making up one application, a custom **target** manages them as a unit.

`/etc/systemd/system/laravel-app.target`:

```ini
[Unit]
Description=Laravel Application Stack
After=network.target

Wants=laravel-queue.service
Wants=laravel-schedule.timer
Wants=laravel-octane.service
```

Each member unit also needs, in its `[Unit]` section:

```ini
PartOf=laravel-app.target
```

`Wants=` makes the target start its members. `PartOf=` makes stopping or restarting the target propagate to them. Both are needed for full lifecycle management.

```bash
sudo systemctl daemon-reload
sudo systemctl enable laravel-app.target
sudo systemctl start laravel-app.target
sudo systemctl status laravel-app.target
```

`start`, `stop`, `restart`, `enable`, and `disable` now cascade across the stack.

### Ad-hoc alternative

For a one-off operation, unit names can be listed or wildcarded:

```bash
sudo systemctl restart laravel-queue.service laravel-octane.service
sudo systemctl restart 'laravel-queue@*'
```

A target is preferable for anything used repeatedly or at boot; the list form is fine for a single command.

## 2.8 Templates

Several workers of the same shape don't require duplicated unit files. A template uses `@` in the filename:

`/etc/systemd/system/laravel-queue@.service`:

```ini
[Unit]
Description=Laravel Queue Worker %i
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/php artisan queue:work --queue=%i --sleep=3 --tries=3
Restart=always

[Install]
WantedBy=multi-user.target
```

`%i` is substituted with the instance name:

```bash
sudo systemctl enable --now laravel-queue@default
sudo systemctl enable --now laravel-queue@emails
sudo systemctl enable --now laravel-queue@webhooks
```

Each worker handles a different queue, and `systemctl restart 'laravel-queue@*'` restarts them together.

## 2.9 Drop-in overrides

To modify a package-provided unit, create a drop-in rather than editing the file under `/usr/lib`:

```bash
sudo systemctl edit nginx
```

This opens `/etc/systemd/system/nginx.service.d/override.conf`. Only the changed directives are needed:

```ini
[Service]
RestartSec=15
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart nginx
```

Drop-ins merge over the base unit, survive package upgrades, and remain individually auditable. `systemctl cat nginx` prints the base unit followed by every drop-in, showing the effective configuration.

## 2.10 User units

Without root, services can run in a user session:

```bash
mkdir -p ~/.config/systemd/user
# write mytask.service there
systemctl --user daemon-reload
systemctl --user enable --now mytask.service
systemctl --user status mytask.service
journalctl --user -u mytask.service
```

User units normally stop at logout. To keep them running:

```bash
sudo loginctl enable-linger $USER
```

With lingering enabled, user services start at boot and survive logout — useful for personal applications on a VPS.

## 2.11 Hardening

systemd can restrict what a service can access. A compromised queue worker then has limited reach into the host.

Additions to `[Service]`:

```ini
User=www-data
Group=www-data

NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectSystem=strict
ProtectHome=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
RestrictNamespaces=true
LockPersonality=true

ReadWritePaths=/var/www/myapp/storage /var/www/myapp/bootstrap/cache
```

Score the result:

```bash
systemd-analyze security laravel-queue.service
```

Scores run from 1 (unrestricted) to 10 (heavily confined). A Laravel worker typically reaches 5–7 with the directives above.

`ProtectHome=true` blocks all access to `/home`. If the application is deployed under `/home/deploy/app`, use `ProtectHome=read-only` or add the paths to `ReadWritePaths=`. Add directives incrementally and restart the service after each, since over-restriction manifests as permission errors inside the application.

## 2.12 Troubleshooting

In order:

1. **`systemctl status <unit>`** — the `Loaded:`, `Active:`, and trailing log lines answer most questions.
2. **`journalctl -u <unit> -n 50 --no-pager`** — full recent log.
3. **`systemctl cat <unit>`** — the effective unit file, including drop-ins.
4. **`systemd-analyze verify /etc/systemd/system/<unit>.service`** — parse errors and unknown directives.
5. **`systemctl reset-failed <unit>`** — clear a stale failed state.
6. **`systemctl --failed`** — everything currently broken.

Frequent causes:

- **"Command not found"** — `ExecStart` uses a relative path, or a binary outside systemd's `PATH`.
- **"Permission denied"** — the `User=` cannot read `WorkingDirectory=` or write to `storage/`.
- **"Timed out"** — startup exceeded `TimeoutStartSec=`.
- **Edit has no effect** — `daemon-reload` was not run.
- **Works manually, fails at boot** — ordering against a unit that doesn't exist yet. Use `network-online.target` rather than `network.target` when a real network connection is needed.

---

# Part 3 — A Complete Laravel Stack

## Files

```
/etc/systemd/system/
├── laravel-app.target
├── laravel-queue@.service
├── laravel-schedule.service
├── laravel-schedule.timer
└── laravel-octane.service
```

**`laravel-queue@.service`**
```ini
[Unit]
Description=Laravel Queue Worker (%i)
After=network-online.target mysql.service
PartOf=laravel-app.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/php artisan queue:work --queue=%i --sleep=3 --tries=3 --timeout=120
Restart=always
RestartSec=5

NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/myapp/storage /var/www/myapp/bootstrap/cache

[Install]
WantedBy=multi-user.target
```

**`laravel-schedule.service`**
```ini
[Unit]
Description=Laravel Scheduler Run
After=network-online.target mysql.service
PartOf=laravel-app.target

[Service]
Type=oneshot
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/php artisan schedule:run
```

**`laravel-schedule.timer`**
```ini
[Unit]
Description=Run Laravel Scheduler Every Minute

[Timer]
OnCalendar=*:*:00
Persistent=true

[Install]
WantedBy=timers.target
```

**`laravel-octane.service`**
```ini
[Unit]
Description=Laravel Octane (Swoole)
After=network-online.target
PartOf=laravel-app.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/php artisan octane:start --server=swoole --host=127.0.0.1 --port=8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**`laravel-app.target`**
```ini
[Unit]
Description=Laravel Application Stack
After=network.target

Wants=laravel-queue@default.service
Wants=laravel-queue@emails.service
Wants=laravel-schedule.timer
Wants=laravel-octane.service
```

## Starting the stack

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now laravel-app.target
sudo systemctl status laravel-app.target
systemctl list-timers laravel-schedule.timer
journalctl -u laravel-queue@default -f
```

## Deploy sequence

```bash
cd /var/www/myapp && git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
sudo systemctl restart laravel-queue@default laravel-queue@emails laravel-octane
sudo systemctl reload php8.3-fpm
```

Workers and Octane restart; the scheduler does not need to. A `queue:work` process holds the PHP classes it loaded when it started, so a worker started before the deploy continues executing the old code. The scheduler runs as `oneshot` and loads fresh code on every invocation. When a fix works under `php artisan tinker` but not through the queue, a stale worker is the first thing to check.

---

# Cheat Sheet

## Job control

```
cmd &                 background
jobs -l               list with PIDs
fg %1                 foreground
bg %1                 resume stopped in background
Ctrl-Z                suspend
disown %1             detach from job table
nohup cmd >log 2>&1 & survive hangup
```

## systemctl

```
systemctl status U        first command when debugging
systemctl start|stop|restart|reload U
systemctl enable [--now] U
systemctl disable [--now] U
systemctl mask|unmask U   prevent starting at all
systemctl list-units --type=service --state=running
systemctl --failed
systemctl list-timers
systemctl cat U           unit plus drop-ins
systemctl edit U          create a drop-in
systemctl daemon-reload   after every unit edit
systemctl reset-failed U
systemd-analyze security U
systemd-analyze calendar "*:*:00"
journalctl -u U -f
```

## Three recurring causes of confusion

1. **A unit edit has no effect** — `daemon-reload` was not run.
2. **A timer fires once and never again** — the `.service` was enabled instead of the `.timer`.
3. **`ExecStart` behaves unlike the same command in a shell** — no shell is involved. Use absolute paths; wrap in `bash -c` when shell features are required.

---

# Exercises

Run these on a disposable VM (Multipass, Docker, or a cheap VPS).

1. **Job control.** Start `sleep 1000 &`. Note the job number and PID. Suspend it, resume it in the background, then kill it by PID rather than job number. Confirm with `jobs` and `ps`.

2. **`nohup` behavior.** Start `nohup sleep 1000 &` in an SSH session and disconnect. Reconnect and check whether it survived. Then try a bare `sleep 1000 &` and compare the outcome.

3. **First service.** Write a unit that runs `bash -c 'while true; do date >> /tmp/hb.log; sleep 5; done'` as `nobody`. Enable it, follow it with `journalctl -u`, then stop and disable it.

4. **Timer.** Write a `.timer` that appends `date` to `/tmp/cron-test.log` every 30 seconds. Verify with `list-timers` and `journalctl`. Reboot the VM after a scheduled tick should have passed and check whether `Persistent=true` caught up the missed run.

5. **Target.** Create three small `.service` files, group them under a `.target`, add `PartOf=` to each, and confirm that `systemctl stop <target>` stops all three.

6. **Deliberate failure.** Introduce a typo in `ExecStart` (for example, `artisan queue:work` without the full path). Attempt to start it, read the error, then fix it. Note where `systemctl status` pointed.

7. **Hardening.** Take the heartbeat service from exercise 3, add `ProtectHome=true` and `ProtectSystem=strict`, and re-score it with `systemd-analyze security`.

---

# Closing

The difference between a script that works on a laptop and a service that survives production comes down to five properties: **supervision** (restart on crash), **observability** (journald), **scheduling** (timers), **grouping** (targets), and **isolation** (hardening).

`nohup` is a single-purpose tool for one-off commands nobody needs to monitor. As soon as a process must keep working, restart on failure, produce logs, or be managed alongside others, it belongs in a systemd unit. The unit file format is worth learning once: it is the operational layer of every Linux system you'll work on.
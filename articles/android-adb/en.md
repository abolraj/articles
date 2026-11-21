---
title: The Complete ADB Command Reference for Android Development
date: 2026-11-21
excerpt: ADB Android
---

# The Complete ADB Command Reference for Android Development

Android Debug Bridge (ADB) is the single most important command-line tool in an Android developer's toolbox. Whether you're debugging a crash that only happens on a physical device, testing permission flows without tapping through five menus, or automating a UI test, ADB is how you talk directly to the device.

This article is a practical, battle-tested reference. It's organized by what you're trying to accomplish, and every command has been chosen because it's something you'll actually use, not just trivia.

---

## 1. Connecting to devices

Before you can do anything, you need to see what's connected and target a specific device when more than one is attached.

```bash
adb devices
```

This is the "hello world" of ADB. The output lists each connected device with a serial number and a state — `device` (ready), `offline` (not responding), or `unauthorized` (you haven't tapped "Allow" on the phone yet).

To target a specific device when several are attached, prefix any command with `-s`:

```bash
adb -s emulator-5554 install app.apk
adb -s R58M12345 shell
```

**Wireless debugging** (Android 11+) is a two-step process:

```bash
adb pair <device-ip>:<pair-port>     # enter the code shown on the phone
adb connect <device-ip>:5555
```

If ADB gets into a weird state where devices disappear or commands hang, restart the server:

```bash
adb kill-server
adb start-server
```

That fixes the majority of "ADB is broken" problems.

---

## 2. Installing, uninstalling, and inspecting apps

```bash
adb install path/to/app.apk           # install a debug build
adb install -r app.apk                # reinstall, keep app data
adb install -d app.apk                # allow downgrade
adb uninstall com.example.app         # uninstall by package name
adb uninstall -k com.example.app      # uninstall but keep data
```

Note that `uninstall` takes the **package name**, not the APK file name. If you only have the APK and don't know the package, use:

```bash
aapt dump badging app.apk | head -1
```

To list installed packages:

```bash
adb shell pm list packages              # all packages
adb shell pm list packages -3           # only third-party (user-installed)
adb shell pm list packages -s           # only system packages
adb shell pm list packages | grep cook  # find by keyword
```

To clear an app's data (equivalent to "Clear storage" in Settings), useful for testing a fresh-install state:

```bash
adb shell pm clear com.example.app
```

To force-stop a running app:

```bash
adb shell am force-stop com.example.app
```

---

## 3. Logcat — the debugger's lifeline

`logcat` is where you'll spend the most time, and it's also where most people get lost because a bare `adb logcat` dumps thousands of lines per second. The trick is learning the **filter syntax**.

### The filter format

Every filter has the shape `<tag>:<priority>`. Priorities are single letters:

| Letter | Priority  |
|--------|-----------|
| `V`    | Verbose   |
| `D`    | Debug     |
| `I`    | Info      |
| `W`    | Warning   |
| `E`    | Error     |
| `F`    | Fatal     |
| `S`    | Silent    |

### The two you'll use 90% of the time

**Show only errors:**

```bash
adb logcat '*:E'
```

The `*` means "all tags," and `:E` means "Error priority and above." This is the fastest way to see what's actually breaking without scrolling through system chatter. **Always wrap the filter in single quotes** in your shell — otherwise `*` gets glob-expanded by bash and ADB receives garbage.

**Show one tag at Info and above, silence everything else:**

```bash
adb logcat 'MyTag:I *:S'
```

This is the classic "silence all, then whitelist" pattern. The trailing `*:S` sets every other tag to Silent, so only `MyTag` messages survive. **Note the single quotes** — this is exactly the "mix of filters inside quotes" pattern that trips people up. Without quotes, the shell mangles it.

You can chain as many tags as you want:

```bash
adb logcat 'ActivityManager:I MyApp:D *:S'
```

### Other useful logcat invocations

```bash
adb logcat -c                         # clear the buffer (do this before reproducing a bug)
adb logcat -d                         # dump the buffer and exit (non-interactive)
adb logcat -b crash                   # only the crash buffer
adb logcat -b main -b system          # specific buffers
adb logcat -v time                    # prefix each line with a timestamp
adb logcat -v color                   # ANSI colors by priority (great for terminals)
```

### Filtering by PID — the precise method

When you want everything your app emitted (not just errors), filter by its process ID:

```bash
adb logcat --pid=$(adb shell pidof -s com.example.app)
```

This is invaluable when your app is crashing and you need to see its final moments. The downside: you have to catch the PID before the process dies, so use it for long-running diagnosis, not instant crashes.

### The crash workflow

If an app crashes instantly on launch, the trick is to have logcat **already recording** before you tap the icon:

```bash
adb logcat -c                                              # clean slate
adb logcat -v time > crash.txt &                           # record to file
# ... launch the app on the device ...
# ... wait for it to crash ...
kill %1                                                    # stop recording
grep -A 20 'FATAL EXCEPTION' crash.txt                     # find the crash
```

The block starting with `FATAL EXCEPTION` is what you want. Read it **bottom-up** through the `Caused by:` lines — the last one is almost always the root cause.

---

## 4. File operations

```bash
adb push local.txt /sdcard/                 # computer → device
adb pull /sdcard/file.txt ./                # device → computer
adb pull /sdcard/DCIM/ ./photos/            # recursively pull a folder
adb shell ls /sdcard/                       # list files on device
```

The screenshots and videos you take on the device live in `/sdcard/DCIM/` or `/sdcard/Pictures/`, so `adb pull` is how you grab them.

---

## 5. The shell, input simulation, and device info

```bash
adb shell                                   # interactive shell on device
adb shell ps                                # running processes
adb shell top                               # live CPU/memory usage
adb shell dumpsys battery                   # battery state
adb shell getprop ro.product.model          # device model
adb shell getprop ro.build.version.release  # Android version
adb shell wm size                           # screen resolution
```

### Simulating user input

This is how you script UI interactions and reproduce bugs without touching the phone:

```bash
adb shell input tap 500 500                 # tap at X=500, Y=500
adb shell input swipe 200 800 200 200       # swipe up (from bottom to top)
adb shell input text "hello world"          # type text
adb shell input keyevent 26                 # Power
adb shell input keyevent 3                  # Home
adb shell input keyevent 4                  # Back
adb shell input keyevent 66                 # Enter
```

Note: `input text` does not handle spaces well in all Android versions — use `%s` instead of a space if you hit trouble:

```bash
adb shell input text "hello%sworld"
```

### Other power-user shell one-liners

**Take a screenshot directly to your computer** (no intermediate file on the device):

```bash
adb exec-out screencap -p > screenshot.png
```

**Record the screen:**

```bash
adb shell screenrecord /sdcard/video.mp4    # stop with Ctrl+C
adb shell screenrecord --time-limit 30 /sdcard/video.mp4
```

**Simulate battery conditions** (great for testing power-save behavior):

```bash
adb shell dumpsys battery set level 1        # 1% battery
adb shell dumpsys battery unplug             # pretend unplugged
adb shell dumpsys battery reset              # restore real values
```

**Force Doze mode** to see how your app behaves under aggressive battery saving:

```bash
adb shell dumpsys deviceidle force-idle
```

---

## 6. Permissions and APK extraction

**Grant or revoke a runtime permission** without tapping through Settings:

```bash
adb shell pm grant com.example.app android.permission.CAMERA
adb shell pm revoke com.example.app android.permission.CAMERA
```

**Extract the installed APK** from a device — useful when you want to inspect what's actually running:

```bash
adb pull $(adb shell pm path com.example.app | cut -d: -f2) ./app.apk
```

**See what permissions an installed app declares:**

```bash
adb shell dumpsys package com.example.app | grep -A 5 "requested permissions"
```

---

## 7. Performance and debugging utilities

**Watch an app's memory** in a loop:

```bash
adb shell "watch -n 1 'dumpsys meminfo com.example.app | grep TOTAL'"
```

The double quotes matter here — the command inside needs to reach the device shell intact.

**Port forwarding** — expose a server running inside the device on your host machine:

```bash
adb forward tcp:8080 tcp:8080
```

Now `http://localhost:8080` on your computer talks to `localhost:8080` on the device. Useful for debugging in-app web servers or proxying traffic.

**See the activity back stack:**

```bash
adb shell dumpsys activity activities | grep -E "Hist|mResumed"
```

**Check what's holding a wakelock:**

```bash
adb shell dumpsys power | grep -i wake
```

---

## 8. Quick reference card

Here's a compact cheat sheet of the commands you'll reach for most often:

```bash
# Connection
adb devices
adb -s <serial> <command>
adb kill-server && adb start-server

# Install & manage
adb install -r app.apk
adb uninstall com.example.app
adb shell pm clear com.example.app
adb shell am force-stop com.example.app

# Logcat
adb logcat -c
adb logcat '*:E'
adb logcat 'MyTag:I *:S'
adb logcat 'Tag1:V Tag2:D *:S'
adb logcat --pid=$(adb shell pidof -s com.example.app)

# Files
adb push local /sdcard/
adb pull /sdcard/file ./file
adb exec-out screencap -p > shot.png

# Shell
adb shell
adb shell input tap 500 500
adb shell input text "hello"
adb shell input keyevent 3

# Permissions
adb shell pm grant com.example.app android.permission.CAMERA
adb shell pm revoke com.example.app android.permission.CAMERA
```

---

## 9. The three habits that make ADB stick

If you take nothing else away from this article, internalize these three habits:

1. **Always quote your logcat filters.** `'*:E'` and `'MyTag:I *:S'` — the single quotes are not optional. Without them, bash glob-expands the `*` and you get nonsense.

2. **Clear the buffer before reproducing a bug.** `adb logcat -c` first, then trigger the bug, then read. Otherwise you're searching through noise from before you even started.

3. **Record to a file, then grep.** When the bug is a crash, piping `adb logcat -v time > crash.txt` and then `grep -A 20 'FATAL EXCEPTION' crash.txt` is faster and more reliable than trying to catch the exception as it scrolls by.

Once you've used ADB for a week, the terminal becomes the fastest way to interact with a device — faster than Android Studio's UI, faster than tapping through screens. The commands above are the 20% that cover 80% of real debugging work.

---

*Have a favorite ADB trick that isn't here? The best one always seems to come from someone else's shell history.*
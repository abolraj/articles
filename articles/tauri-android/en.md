---
title: Tauri + Android on Ubuntu
date: 2026-11-18
excerpt: A complete, sanction-proof workflow for Iranian beginners — including Myket's offline SDK CSV method
---

# The Senior Master's Guide to Tauri + Android on Ubuntu

### A Complete, Sanction-Proof Workflow for Iranian Beginners — including Myket's offline SDK CSV method

---

## 1. What Is Tauri? (Rust + Web = Cross-Platform)

Tauri is a framework for building tiny, fast, and secure **cross-platform desktop and mobile applications**. It combines a **Rust backend** (for system-level logic, file access, and performance) with a **web frontend** (React, Vue, Svelte, or plain HTML/CSS/JS). The result is a native application that uses the operating system's WebView instead of bundling a full browser engine—which is why Tauri apps are dramatically smaller than Electron apps.

For Iranian developers, Tauri is particularly attractive because:

- **Rust is sanction-resistant**: no dependency on Google or Apple services.
- **The Android build is fully local**: you produce an APK on your Ubuntu machine without needing Android Studio.
- **Iranian mirrors exist** for Cargo, Gradle, and Maven—and **Myket now publishes the Android SDK itself** via a CSV, so even `sdkmanager` can be bypassed entirely.

This guide walks you from a bare Ubuntu system to a signed, installable **~11 MB APK** in **30–60 minutes**, assuming a stable internet connection and the mirror configurations provided below.

---

## 2. The Toolchain Decoded

Before touching a single command, understand what each piece does. This prevents the "copy-paste and pray" trap.

| Tool | What It Is | Why You Need It |
|------|-----------|-----------------|
| **JDK (Java Development Kit)** | The Java compiler and runtime. Tauri's Android build uses **JDK 17**; JDK 21 or 8 will cause failures. | Gradle runs on the JVM. `keytool` (for signing) lives here. |
| **Android SDK** | The Android Platform (API level), Build-Tools, Platform-Tools (`adb`), and Command-line Tools. | Provides `aapt2`, `d8`, and the platform `android.jar`. **SDK Platform 35** is required. |
| **Android NDK (Native Development Kit)** | The C/C++ cross-compiler toolchain for Android. | Rust compiles native code for ARM. **NDK r29 (`29.0.14206865`)** is the stable choice for modern Tauri builds. |
| **Gradle** | The build system that assembles Android projects. | Tauri generates a Gradle project under `src-tauri/gen/android/`. **Gradle 8.13** is used here. |
| **Gradlew (Gradle Wrapper)** | A script that downloads and runs a *pinned* Gradle version per project. | Ensures reproducible builds regardless of what Gradle is installed system-wide. |
| **Cargo** | Rust's package manager and build tool. | Downloads crates, compiles Rust, and orchestrates the entire Tauri build. |
| **rustup** | The Rust toolchain installer and version manager. | Installs Rust and, crucially, **cross-compilation targets** like `aarch64-linux-android`. |
| **Android Targets** | Rust's precompiled standard libraries for Android ABIs. | Without `aarch64-linux-android`, Cargo cannot produce ARM64 binaries. |

---

## 3. Prerequisites at a Glance

| Requirement | Minimum / Recommended | Verify With |
|-------------|----------------------|-------------|
| Ubuntu | 22.04 LTS or newer | `lsb_release -a` |
| Node.js | 18 LTS or 20 LTS | `node -v` |
| pnpm (or npm) | pnpm 8+ | `pnpm -v` |
| Rust | 1.77+ (stable) | `rustc --version` |
| Cargo | Comes with Rust | `cargo --version` |
| JDK | **17** (not 21, not 8) | `java -version` |
| Android SDK | **Platform 35** + Build-Tools 35.0.1 + Platform-Tools | `sdkmanager --list_installed` |
| Android NDK | **r29 (`29.0.14206865`)** | `ls $ANDROID_HOME/ndk` |
| Gradle (wrapper) | **8.13** | Defined in `gradle-wrapper.properties` |
| Disk Space | ~10 GB free | `df -h` |
| RAM | 8 GB+ recommended | `free -h` |

---

## 4. Step 1 — Install the Core Toolchain (Node, pnpm, Rust)

Open a terminal and run the following block. It installs Node, pnpm, and Rust via `rustup`.

```bash
# --- Node.js (LTS) ---
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# --- pnpm ---
sudo npm install -g pnpm

# --- Rust + rustup ---
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

# --- Verify ---
node -v      # v20.x
pnpm -v      # 8.x or 9.x
rustc --version
cargo --version
```

> **Iranian tip:** If `sh.rustup.rs` is unreachable, use the Shecan mirror:
> ```bash
> export RUSTUP_DIST_SERVER="https://mirror-rustup.pkg.shecan.ir"
> export RUSTUP_UPDATE_ROOT="https://mirror-rustup.pkg.shecan.ir/rustup"
> ```

---

## 5. Step 2 — Install the Android Build Dependencies

Tauri needs **JDK 17**, **SDK Platform 35**, **Build-Tools 35.0.1**, **Platform-Tools** (`adb`), and **NDK r29**. There are **two ways** to get them. Choose the one that matches your network situation:

- **Path A — `sdkmanager` (automatic, online).** Works if `dl.google.com` is reachable. Fastest.
- **Path B — Myket CSV (manual, offline / sanction-proof).** Use this when `sdkmanager` hangs, times out, or returns 403. This is the method Myket explicitly documents for Iranian users.

### 5.1 Path A — Automated via `sdkmanager`

```bash
# ============================================================
#  ANDROID BUILD DEPENDENCIES FOR TAURI (online path)
#  JDK 17  +  SDK 35  +  NDK 29  +  Build-Tools  +  ADB
# ============================================================

# 1. Install JDK 17 (Tauri requires 17; JDK 21 will break Gradle)
sudo apt update
sudo apt install -y openjdk-17-jdk
java -version                       # must report "17.x"

# 2. Create the Android SDK directory structure
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
mkdir -p "$ANDROID_HOME/cmdline-tools"

# 3. Download Google's command-line tools
#    (Iranian mirror shown in the comment below if Google blocks you)
cd /tmp
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
# mirror fallback: https://maven.myket.ir/... (see Path B note at end of §5)
unzip -q commandlinetools-linux-*.zip -d "$ANDROID_HOME/cmdline-tools"
mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"

# 4. Add sdkmanager to PATH for this session
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# 5. Accept all licences non-interactively
yes | sdkmanager --licenses

# 6. Install the EXACT packages Tauri needs
sdkmanager \
  "platform-tools" \
  "platforms;android-35" \
  "build-tools;35.0.1" \
  "ndk;29.0.14206865"

# 7. Verify
sdkmanager --list_installed | grep -E "platforms;android-35|build-tools;35.0.1|ndk;29.0.14206865|platform-tools"
adb version
```

### 5.2 Path B — Manual via Myket CSV (Recommended for Iran)

Myket publishes a CSV containing every SDK package with a **direct mirror URL on `maven.myket.ir`** and a **SHA-1 checksum**. This bypasses `dl.google.com` entirely. The CSV columns are:

| Column | Meaning |
|--------|---------|
| `package_path` | Target path inside `$ANDROID_HOME` (e.g. `platforms;android-35`) |
| `package_display_name` | Human-readable name |
| `package_revision` | Version number |
| `archive_url` | Direct download URL on `maven.myket.ir` |
| `archive_size` | Size in bytes |
| `archive_checksum` | **SHA-1** hash for integrity verification |

The four rows this guide actually needs, pulled from the CSV:

| Package | Archive | SHA-1 | Size |
|---------|---------|-------|------|
| `platforms;android-35` (r02) | `platform-35_r02.zip` | `0bb560a90a7a2cbd0dd8348224d518b638fe7949` | ~64 MB |
| `build-tools;35.0.1` (Linux) | `build-tools_r35.0.1_linux.zip` | `e009a9b188cfeb1d2b4c318ab5cb4f1ddc368861` | ~62 MB |
| `ndk;29.0.14206865` (Linux) | `android-ndk-r29-linux.zip` | `87e2bb7e9be5d6a1c6cdf5ec40dd4e0c6d07c30b` | ~784 MB |
| `platform-tools` | *(not in the visible CSV excerpt)* | — | — |

> **Note on `platform-tools` and `cmdline-tools`:** The CSV excerpt you have is truncated at `build-tools;36`. Myket's full CSV typically also contains `platform-tools` rows—grep the CSV for `platform-tools;`. If it is absent, `platform-tools` is small (~5 MB) and usually still reachable from Google; install it with `sdkmanager "platform-tools"`. `cmdline-tools` itself is only needed for `sdkmanager`; on the manual path you can skip it.

#### The one copy-paste script (fully commented)

```bash
#!/usr/bin/env bash
# ============================================================
#  Manual Android SDK install from Myket CSV (Linux x86_64)
#  Packages: Platform 35, Build-Tools 35.0.1, NDK 29.0.14206865
#  Verifies every download against the SHA-1 in the CSV.
# ============================================================
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
WORK="$HOME/Downloads/myket-sdk"
mkdir -p "$WORK" "$ANDROID_HOME"/{platforms,build-tools,ndk,platform-tools}

cd "$WORK"

# ---------- 1. SDK Platform 35 (r02) ----------
URL="https://maven.myket.ir/android-sdk/platform-35_r02.zip"
SHA="0bb560a90a7a2cbd0dd8348224d518b638fe7949"
FILE="platform-35_r02.zip"
[ -f "$FILE" ] || curl -L --retry 3 -O "$URL"
echo "$SHA  $FILE" | sha1sum -c -                 # verify integrity
unzip -q "$FILE" -d "$ANDROID_HOME/platforms/"
# zip extracts to platforms/android-35/ directly

# ---------- 2. Build-Tools 35.0.1 (Linux) ----------
URL="https://maven.myket.ir/android-sdk/build-tools_r35.0.1_linux.zip"
SHA="e009a9b188cfeb1d2b4c318ab5cb4f1ddc368861"
FILE="build-tools_r35.0.1_linux.zip"
[ -f "$FILE" ] || curl -L --retry 3 -O "$URL"
echo "$SHA  $FILE" | sha1sum -c -
rm -rf /tmp/bt-extract && mkdir -p /tmp/bt-extract
unzip -q "$FILE" -d /tmp/bt-extract
# zip contains exactly one top-level dir; grab it and rename
TOP=$(ls -d /tmp/bt-extract/*/ | head -n1)
rm -rf "$ANDROID_HOME/build-tools/35.0.1"
mv "$TOP" "$ANDROID_HOME/build-tools/35.0.1"

# ---------- 3. NDK r29 (29.0.14206865) Linux ----------
URL="https://maven.myket.ir/android-sdk/android-ndk-r29-linux.zip"
SHA="87e2bb7e9be5d6a1c6cdf5ec40dd4e0c6d07c30b"
FILE="android-ndk-r29-linux.zip"
[ -f "$FILE" ] || curl -L --retry 3 -O "$URL"
echo "$SHA  $FILE" | sha1sum -c -
rm -rf /tmp/ndk-extract && mkdir -p /tmp/ndk-extract
unzip -q "$FILE" -d /tmp/ndk-extract
rm -rf "$ANDROID_HOME/ndk/29.0.14206865"
mv /tmp/ndk-extract/android-ndk-r29 "$ANDROID_HOME/ndk/29.0.14206865"

# ---------- 4. Verify everything landed ----------
echo "--- platform ---";   ls "$ANDROID_HOME/platforms/android-35/android.jar"
echo "--- build-tools ---"; ls "$ANDROID_HOME/build-tools/35.0.1/aapt2"
echo "--- ndk ---";         ls -d "$ANDROID_HOME/ndk/29.0.14206865/toolchains"
echo "✅ Manual SDK install complete."
```

Save it as `~/install-sdk-myket.sh`, `chmod +x` it, and run it:

```bash
chmod +x ~/install-sdk-myket.sh
~/install-sdk-myket.sh
```

After it finishes, `sdkmanager --list_installed` will still recognize these packages because each Google zip embeds a `package.xml` / `source.properties` file that the tool reads.

> **If `platform-tools` is missing from the CSV excerpt:** run `sdkmanager "platform-tools"` (small download). If that also fails, grab the Platform-Tools zip from Google's repository page and extract it directly into `$ANDROID_HOME/platform-tools/`.

---

## 6. Step 3 — Persist the Paths (Do Not Skip This)

Android tools must be visible in every new shell. Append the following to `~/.bashrc` (or `~/.zshrc`):

```bash
# ===== Android / Tauri environment =====
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export NDK_HOME="$ANDROID_HOME/ndk/29.0.14206865"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
export PATH="$NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin:$PATH"
```

Reload the shell and verify every path:

```bash
source ~/.bashrc
echo $ANDROID_HOME      # /home/<you>/Android/Sdk
which adb               # .../platform-tools/adb
ls $NDK_HOME            # ndk-build, toolchains, ...
```

---

## 7. Step 4 — Folder Structure (Exactly as Myket Documents It)

Myket's official SDK layout is the same one Google's `sdkmanager` produces. Whether you used Path A or Path B above, your `$ANDROID_HOME` must end up looking like this:

```
$HOME/Android/Sdk/
├── build-tools/
│   └── 35.0.1/                ← extracted from build-tools_r35.0.1_linux.zip
│       ├── aapt2
│       ├── apksigner          ← YOU WILL USE THIS FOR SIGNING
│       ├── zipalign
│       └── package.xml
├── cmdline-tools/
│   └── latest/
│       └── bin/
│           └── sdkmanager
├── emulator/                  ← optional
├── ndk/
│   └── 29.0.14206865/         ← renamed from android-ndk-r29/
│       └── toolchains/llvm/prebuilt/linux-x86_64/bin/
│           ├── aarch64-linux-android21-clang
│           └── ...
├── platform-tools/
│   └── adb
└── platforms/
    └── android-35/            ← extracted from platform-35_r02.zip
        ├── android.jar
        └── package.xml
```

**Mapping between the CSV `package_path` column and the folder on disk:**

| CSV `package_path` | Actual folder in `$ANDROID_HOME` |
|--------------------|----------------------------------|
| `platforms;android-35` | `platforms/android-35/` |
| `build-tools;35.0.1` | `build-tools/35.0.1/` |
| `ndk;29.0.14206865` | `ndk/29.0.14206865/` |
| `platform-tools` | `platform-tools/` |

> **Why the rename matters:** Google's build-tools zips extract to a folder named after the *release* (e.g. `android-15/`), and NDK zips extract to `android-ndk-r29/`. `sdkmanager` normally performs this rename automatically. When you extract manually, **you must rename to the version number** or Gradle will not find the tools.

When you create a Tauri project, the **generated Android project** lives inside your app, not in the SDK:

```
your-tauri-app/
└── src-tauri/
    └── gen/
        └── android/
            ├── app/                     ← the Android application module
            ├── gradle/wrapper/
            │   └── gradle-wrapper.properties   ← Gradle 8.13 pinned here
            ├── settings.gradle          ← you will add mirrors here
            ├── build.gradle
            └── keystore.properties      ← you will create this for signing
```

---

## 8. Step 5 — Iranian Mirrors (The Sanction-Proof Layer)

Even with the SDK installed from Myket, Gradle will still try to fetch Android Gradle Plugin artifacts from `dl.google.com` and `repo.maven.apache.org`. The configurations below redirect every request to an Iranian mirror. The SDK archives themselves already live on `maven.myket.ir` (the same host your CSV script uses), so the mirror infrastructure is consistent end-to-end.

### 8.1 Global Gradle Mirror — `~/.gradle/init.gradle`

This file applies mirrors to **every Gradle project** on your machine. Create it:

```bash
mkdir -p ~/.gradle
nano ~/.gradle/init.gradle
```

Paste the following **exactly**:

```groovy
allprojects {
    buildscript {
        repositories.clear()
        repositories {
            maven { url = uri("https://mirror-maven.runflare.com/android/maven2/") }
            maven { url = uri("https://mirror-maven.runflare.com/maven2/") }
            maven { url = uri("https://mirror-maven.runflare.com/gradle-plugins/") }

            maven { url = uri('https://mirror-maven.pkg.shecan.ir/gradle-plugins') }
            maven { url = uri('https://en-mirror.ir') }
            maven { url = uri('https://maven.myket.ir') }
            maven { url = uri('https://maven.devneeds.ir') }
            maven { url = uri('https://gradle.iranrepo.ir') }
            maven { url = uri('https://gradle.jamko.ir') }
            maven { url = uri('https://maven.aliyun.com/repository/gradle-plugin') }
            maven { url = uri('https://maven.aliyun.com/repository/google') }
            mavenCentral()
            google()
        }
    }
    project.repositories.clear()
    project.repositories {
        maven { url = uri('https://mirror-maven.pkg.shecan.ir/google') }
        maven { url = uri('https://mirror-maven.pkg.shecan.ir/central') }
        maven { url = uri('https://mirror-maven.pkg.shecan.ir/jitpack') }

        maven { url = uri('https://en-mirror.ir') }
        maven { url = uri('https://maven.myket.ir') }
        maven { url = uri('https://maven.devneeds.ir') }
        maven { url = uri('https://gradle.iranrepo.ir') }
        maven { url = uri('https://gradle.jamko.ir') }
        maven { url = uri('https://maven.aliyun.com/repository/public') }
        maven { url = uri('https://maven.aliyun.com/repository/central') }
        maven { url = uri('https://maven.aliyun.com/repository/google') }
        mavenCentral()
        google()
    }
}
```

**Why this order?** Runflare and Shecan are the fastest Iranian mirrors; Myket and DevNeeds are Android-focused; Jamko and IranRepo provide fallbacks; Aliyun (China) acts as a backup when Iranian mirrors are down; official repositories are the last resort.

### 8.2 Per-App Gradle Mirror — `src-tauri/gen/android/settings.gradle`

The global `init.gradle` covers most cases, but Tauri's generated project uses `dependencyResolutionManagement` with `PREFER_SETTINGS`. You must also edit the project-level `settings.gradle`:

```bash
# Run this AFTER creating your Tauri app (see Step 7)
nano src-tauri/gen/android/settings.gradle
```

Replace its contents with:

```groovy
pluginManagement {
    repositories {
        maven { url = uri("https://mirror-maven.runflare.com/android/maven2/") }
        maven { url = uri("https://mirror-maven.runflare.com/maven2/") }
        maven { url = uri("https://mirror-maven.runflare.com/gradle-plugins/") }
        maven { url = uri('https://mirror-maven.pkg.shecan.ir/gradle-plugins') }

        // Myket — highest priority for Android artifacts
        maven { url = uri('https://en-mirror.ir') }
        maven { url = uri('https://maven.myket.ir') }

        maven { url = uri('https://maven.devneeds.ir') }
        maven { url = uri('https://gradle.iranrepo.ir') }
        maven { url = uri('https://gradle.jamko.ir') }
        maven { url = uri('https://archive.ito.gov.ir/gradle/maven-plugin/') }

        maven { url = uri('https://maven.aliyun.com/repository/gradle-plugin') }
        maven { url = uri('https://maven.aliyun.com/repository/google') }

        google()
        gradlePluginPortal()
        mavenCentral()
    }
}

plugins {
    id 'org.gradle.toolchains.foojay-resolver-convention' version '0.8.0'
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        maven { url = uri('https://mirror-maven.pkg.shecan.ir/google') }
        maven { url = uri('https://mirror-maven.pkg.shecan.ir/central') }
        maven { url = uri('https://mirror-maven.pkg.shecan.ir/jitpack') }

        maven { url = uri('https://en-mirror.ir') }
        maven { url = uri('https://maven.myket.ir') }
        maven { url = uri('https://maven.devneeds.ir') }
        maven { url = uri('https://gradle.iranrepo.ir') }
        maven { url = uri('https://gradle.jamko.ir') }
        maven { url = uri('https://archive.ito.gov.ir/gradle/maven-plugin/') }

        maven { url = uri('https://maven.aliyun.com/repository/public') }
        maven { url = uri('https://maven.aliyun.com/repository/central') }
        maven { url = uri('https://maven.aliyun.com/repository/google') }

        google()
        mavenCentral()
        maven { url = uri('https://jitpack.io') }
    }
}

include ':app'

apply from: 'tauri.settings.gradle'
```

### 8.3 Gradle Wrapper Distribution — Pin 8.13 via Shecan

Tauri's generated project pins Gradle 8.13. Point the wrapper to the Shecan mirror so the distribution download does not stall:

```bash
nano src-tauri/gen/android/gradle/wrapper/gradle-wrapper.properties
```

Set the `distributionUrl` line to:

```properties
distributionUrl=https://mirror-gradle.pkg.shecan.ir/distributions/gradle-8.13-bin.zip
```

The full file should resemble:

```properties
distributionBase=GRADLE_USER_HOME
distributionUrl=https://mirror-gradle.pkg.shecan.ir/distributions/gradle-8.13-bin.zip
distributionPath=wrapper/dists
zipStorePath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
```

### 8.4 Cargo Mirror — `~/.cargo/config.toml`

Rust crates are fetched via the **sparse index**. Shecan provides a fast Iranian mirror:

```bash
nano ~/.cargo/config.toml
```

```toml
[source.crates-io]
replace-with = "shecan"

[source.shecan]
registry = "sparse+https://mirror-cargo.pkg.shecan.ir/index/"
```

Verify:

```bash
cargo search serde   # should return results quickly
```

---

## 9. Step 6 — Optimize Cargo for Size (`Cargo.toml`)

A default release build includes debug symbols and does not optimize for size. Add this to your **project's** `src-tauri/Cargo.toml`:

```toml
[profile.release]
opt-level = "s"      # optimize for size, not speed
lto = true           # link-time optimization
codegen-units = 1    # better optimization (slower compile)
panic = "abort"      # smaller binary, no unwinding tables
strip = true         # remove symbols
```

This combination is what brings the **arm64 APK down to ~11 MB** instead of 40–50 MB.

---

## 10. Step 7 — Create and Run the Tauri App

### 10.1 Scaffold a New App

```bash
pnpm create tauri-app
```

Choose:

- **Project name:** `my-tauri-app`
- **Frontend language:** TypeScript / JavaScript
- **Package manager:** pnpm
- **UI template:** React (or your preference)
- **UI flavor:** TypeScript

```bash
cd my-tauri-app
pnpm install
```

### 10.2 Add the Android Rust Target

```bash
rustup target add aarch64-linux-android
rustup target list --installed | grep aarch64-linux-android
```

### 10.3 Initialize the Android Project

```bash
pnpm tauri android init
```

This creates `src-tauri/gen/android/`. **Now go back to Step 8.2 and 8.3** to insert the per-app mirrors and Gradle wrapper URL.

### 10.4 Desktop Development (Sanity Check)

```bash
pnpm tauri dev
```

A native desktop window opens. The Rust backend runs; the frontend is served by Vite. If this fails, do not proceed to Android—fix the desktop build first.

---

## 11. Step 8 — Android Development and the Critical `adb reverse`

### 11.1 Prepare the Phone

On the Android device:

1. Enable **Developer Options** (tap *Build Number* 7 times).
2. Enable **USB Debugging**.
3. Connect via USB and authorize the computer.

Verify:

```bash
adb devices
# List of devices attached
# ABC123456789    device
```

If the device shows `unauthorized`, revoke USB debugging authorizations on the phone and reconnect.

### 11.2 The `adb reverse` Requirement

The Vite dev server runs on your **Ubuntu machine** at `localhost:1420`. The phone cannot reach your `localhost`. You must reverse the port:

```bash
adb reverse tcp:1420 tcp:1420
```

Additionally, Vite must listen on all interfaces. Edit `vite.config.ts` (or `.js`):

```ts
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 1420,
    strictPort: true,
  },
  // ... rest of config
});
```

### 11.3 Run Android Dev Mode

```bash
pnpm tauri android dev --host 0.0.0.0
```

This compiles the Rust backend for ARM64, installs the debug APK on the connected phone, and hot-reloads the frontend. **This is the mode you should use for day-to-day development.**

---

## 12. Step 9 — Build the Release APK (aarch64 Only)

### 12.1 Do Not Use `--debug` for Release

> **Critical warning:** `pnpm tauri android build --debug` produces an APK around **500 MB** because the Rust `dev` profile includes debug symbols and no optimizations. It is useless for distribution and wastes time.

### 12.2 The Correct Command

```bash
pnpm tauri android build --apk --target aarch64
```

Why `aarch64`?

- `aarch64` maps to Android ABI **`arm64-v8a`**, which covers **virtually all modern Android phones** (2018 onward).
- Building **all targets** (armv7, x86, x86_64) inflates the APK to **150–200 MB** and slows the build.

### 12.3 Output Location

The APK lands here:

```
src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

Expected size: **~11 MB** (with the Cargo size profile from Step 9).

### 12.4 Check Your Device's Architecture (Before Building)

If you are unsure whether your phone is `arm64-v8a`:

```bash
adb shell getprop ro.product.cpu.abi
```

Typical outputs:

- `arm64-v8a` → use `--target aarch64` ✅
- `armeabi-v7a` → use `--target armv7` (older devices)
- `x86_64` → emulator only

For a full list of supported ABIs:

```bash
adb shell getprop ro.product.cpu.abilist
```

---

## 13. Step 10 — Sign the APK (Mandatory for Installation)

An unsigned release APK **will not install** on a real device. Android requires a valid signature. Tauri supports standard Java keystore signing.

### 13.1 Generate a Keystore (One Time)

```bash
keytool -genkeypair -v \
  -keystore ~/my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Your Name, OU=Mobile, O=YourOrg, L=Tehran, ST=Tehran, C=IR"
```

Keep this file **safe and backed up**. Losing it means you cannot update your app on markets.

### 13.2 Create `keystore.properties`

Inside the generated Android project:

```bash
nano src-tauri/gen/android/keystore.properties
```

```properties
storeFile=/home/YOUR_USER/my-release-key.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=my-key-alias
keyPassword=YOUR_KEY_PASSWORD
```

> Replace `YOUR_USER` with your actual Linux username. Use absolute paths.

### 13.3 Sign with `apksigner`

Gradle may sign automatically if `keystore.properties` is present, but you can always sign manually with the SDK's `apksigner`:

```bash
APK="src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk"
BUILD_TOOLS="$ANDROID_HOME/build-tools/35.0.1"

# Align first (required before signing)
"$BUILD_TOOLS/zipalign" -v 4 "$APK" /tmp/app-aligned.apk

# Sign
"$BUILD_TOOLS/apksigner" sign \
  --ks ~/my-release-key.keystore \
  --ks-key-alias my-key-alias \
  --ks-pass pass:YOUR_STORE_PASSWORD \
  --key-pass pass:YOUR_KEY_PASSWORD \
  --out /tmp/app-signed.apk \
  /tmp/app-aligned.apk

# Verify
"$BUILD_TOOLS/apksigner" verify --verbose /tmp/app-signed.apk
```

The `apksigner` tool applies APK Signature Scheme v2/v3 + v4, which is what modern Android versions and marketplaces require.

### 13.4 Install the Signed APK

```bash
adb install /tmp/app-signed.apk
```

---

## 14. Important Commands — Cheat Sheet

| Command | What It Does | When to Use |
|---------|-------------|-------------|
| `pnpm tauri dev` | Opens a **desktop window** with Rust backend + Vite frontend. The browser-only version will not work because the Rust IPC layer is absent. | Desktop development and logic testing. |
| `pnpm tauri android dev --host 0.0.0.0` | Builds and installs a **debug APK** on the USB-connected phone, with frontend hot-reload. Requires `adb reverse tcp:1420 tcp:1420` and Vite `host: "0.0.0.0"`. | Daily Android development. **This is the mode you want.** |
| `pnpm tauri android build --debug` | ⛔ **AVOID.** Produces a ~500 MB debug APK with symbols. Useless for distribution. | Never, unless debugging native crashes. |
| `pnpm tauri android build --apk --target aarch64` | ✅ **The release command.** Produces a ~11 MB universal APK at `.../apk/universal/release/app-universal-release.apk`. | Final builds for Myket, Bazaar, or direct install. |
| `adb devices` | Lists connected devices. | Before any `android dev` or `install`. |
| `adb reverse tcp:1420 tcp:1420` | Forwards the phone's `localhost:1420` to your PC's Vite server. | Every time you reconnect the phone in dev mode. |
| `adb shell getprop ro.product.cpu.abi` | Prints the device ABI (`arm64-v8a`, `armeabi-v7a`, `x86_64`). | Before choosing a build target. |
| `adb shell getprop ro.product.cpu.abilist` | Lists **all** supported ABIs. | For thorough architecture checks. |
| `sdkmanager --list_installed` | Shows installed SDK/NDK packages. | Troubleshooting missing platforms. |
| `sha1sum -c` | Verifies a Myket CSV download. | After every manual CSV extraction. |

---

## 15. Summary — The Complete Workflow

Here is the entire process compressed into a checklist. Follow it top-to-bottom.

1. **Install core tools:** Node 20, pnpm, Rust via `rustup`.
2. **Install Android stack — choose ONE path:**
   - **Path A (online):** JDK 17 + `sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.1" "ndk;29.0.14206865"`.
   - **Path B (Myket CSV, offline):** run the §5.2 script — it downloads `platform-35_r02.zip`, `build-tools_r35.0.1_linux.zip`, and `android-ndk-r29-linux.zip` from `maven.myket.ir`, verifies each SHA-1 from the CSV, and places them under `$ANDROID_HOME` with the correct version-number folder names (`platforms/android-35/`, `build-tools/35.0.1/`, `ndk/29.0.14206865/`).
3. **Persist paths:** `ANDROID_HOME`, `NDK_HOME`, and `PATH` in `~/.bashrc` (Step 6).
4. **Configure Iranian mirrors:**
   - `~/.gradle/init.gradle` (global Gradle)
   - `src-tauri/gen/android/settings.gradle` (per-app Gradle, after `android init`)
   - `gradle-wrapper.properties` → Shecan Gradle 8.13
   - `~/.cargo/config.toml` → Shecan sparse index
5. **Optimize `Cargo.toml`:** `opt-level="s"`, `lto=true`, `codegen-units=1`, `panic="abort"`, `strip=true`.
6. **Scaffold the app:** `pnpm create tauri-app` → `pnpm install` → `rustup target add aarch64-linux-android` → `pnpm tauri android init`.
7. **Verify desktop:** `pnpm tauri dev` opens a window.
8. **Android dev:** Enable USB debugging → `adb devices` → `adb reverse tcp:1420 tcp:1420` → `pnpm tauri android dev --host 0.0.0.0`.
9. **Build release:** `pnpm tauri android build --apk --target aarch64`.
10. **Sign:** Generate keystore → `keystore.properties` → `zipalign` + `apksigner` → verify.
11. **Install/distribute:** `adb install` for testing, or upload the signed APK to Myket/Bazaar.

---

## Final Words

Tauri gives Iranian developers a rare advantage: a **fully local, sanction-resilient, cross-platform build pipeline** that produces tiny binaries. The two friction points—SDK acquisition and Maven dependency resolution—are both solved above. **Path B (§5.2)** is the strongest option: it replaces `dl.google.com` with `maven.myket.ir`, verifies every archive against Myket's SHA-1, and reproduces Google's exact on-disk layout so Gradle never notices the difference. Combine it with the Shecan/Runflare/Myket mirrors in §8 and the entire toolchain — from Rust crates to Android platform JARs — lives on Iranian soil.

Keep your keystore backed up, keep your mirrors updated, and build things that matter.
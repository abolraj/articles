---
title: راهنمای جامع Tauri + Android روی اوبونتو
date: 2026-11-18
excerpt: گردش‌کار کامل و مقاوم در برابر تحریم برای تازه‌کارهای ایرانی — شامل روش نصب آفلاین SDK با CSV مایکت
---

# راهنمای جامع Tauri + Android روی اوبونتو

### یک گردش‌کار کامل و مقاوم در برابر تحریم برای تازه‌کارهای ایرانی — همراه با روش CSV آفلاین SDK مایکت

---

## ۱. Tauri چیست؟ (Rust + وب = چندسکویی)

Tauri یک چارچوب برای ساخت برنامه‌های **چندسکویی دسکتاپ و موبایل** با حجم کم، سرعت بالا و امنیت خوب است. در Tauri یک **بک‌اند Rust** (برای منطق سطح سیستم، دسترسی به فایل و کارایی) با یک **فرانت‌اند وب** (React، Vue، Svelte یا HTML/CSS/JS ساده) ترکیب می‌شود. خروجی یک برنامهٔ بومی است که از WebView سیستم‌عامل استفاده می‌کند؛ به همین دلیل حجم برنامه‌های Tauri بسیار کمتر از برنامه‌های Electron است.

برای توسعه‌دهندگان ایرانی، Tauri مزیت‌های مهمی دارد:

- **Rust نسبتاً مقاوم در برابر تحریم است**: وابستگی مستقیم به سرویس‌های Google یا Apple ندارد.
- **ساخت Android کاملاً محلی است**: APK را روی همان اوبونتو می‌سازید و نیازی به Android Studio ندارید.
- **آینه‌های ایرانی** برای Cargo، Gradle و Maven وجود دارد — و **مایکت خود فایل‌های Android SDK را با CSV** منتشر کرده است، بنابراین حتی می‌توانید `sdkmanager` را کاملاً دور بزنید.

این راهنما شما را از یک سیستم خام اوبونتو به یک **APK امضاشده و قابل نصب حدود ۱۱ مگابایت** در **۳۰ تا ۶۰ دقیقه** می‌رساند، به شرط اینکه اتصال اینترنت پایدار باشد و تنظیمات آینه‌های زیر را اعمال کنید.

---

## ۲. اجزای زنجیرهٔ ابزار

قبل از اجرای دستورها، بدانید هر قطعه چه کاری می‌کند. این کار جلوی «کپی-پیست و دعا» را می‌گیرد.

| ابزار | چیست | چرا لازم است |
|------|-------|---------------|
| **JDK (Java Development Kit)** | کامپایلر و زمان‌اجرای Java. ساخت Android در Tauri از **JDK 17** استفاده می‌کند؛ JDK 21 یا 8 باعث خطا می‌شود. | Gradle روی JVM اجرا می‌شود. `keytool` (برای امضا) هم داخل آن است. |
| **Android SDK** | شامل Platform (سطح API)، Build-Tools، Platform-Tools (`adb`) و Command-line Tools. | `aapt2`، `d8` و `android.jar` را فراهم می‌کند. **SDK Platform 35** لازم است. |
| **Android NDK (Native Development Kit)** | زنجیرهٔ کامپایلر متقابل C/C++ برای Android. | Rust کد بومی را برای ARM کامپایل می‌کند. **NDK r29 (`29.0.14206865`)** انتخاب پایدار برای ساخت‌های جدید Tauri است. |
| **Gradle** | سیستم ساخت پروژه‌های Android. | Tauri یک پروژهٔ Gradle زیر `src-tauri/gen/android/` تولید می‌کند. اینجا **Gradle 8.13** استفاده می‌شود. |
| **Gradlew (Gradle Wrapper)** | اسکریپتی که نسخهٔ مشخصی از Gradle را برای هر پروژه دانلود و اجرا می‌کند. | ساخت تکرارپذیر را مستقل از Gradle نصب‌شده روی سیستم تضمین می‌کند. |
| **Cargo** | مدیر بسته و ابزار ساخت Rust. | crateها را دانلود، Rust را کامپایل و کل ساخت Tauri را هماهنگ می‌کند. |
| **rustup** | نصب‌کننده و مدیر نسخهٔ Rust. | Rust و مهم‌تر از آن، **هدف‌های کامپایل متقابل** مثل `aarch64-linux-android` را نصب می‌کند. |
| **Android Targets** | کتابخانه‌های استاندارد از پیش کامپایل‌شدهٔ Rust برای ABIهای Android. | بدون `aarch64-linux-android`، Cargo نمی‌تواند باینری ARM64 بسازد. |

---

## ۳. پیش‌نیازها در یک نگاه

| نیازمندی | حداقل / پیشنهادی | بررسی با |
|----------|------------------|-----------|
| Ubuntu | 22.04 LTS یا جدیدتر | `lsb_release -a` |
| Node.js | 18 LTS یا 20 LTS | `node -v` |
| pnpm (یا npm) | pnpm 8+ | `pnpm -v` |
| Rust | 1.77+ (stable) | `rustc --version` |
| Cargo | همراه Rust می‌آید | `cargo --version` |
| JDK | **17** (نه 21، نه 8) | `java -version` |
| Android SDK | **Platform 35** + Build-Tools 35.0.1 + Platform-Tools | `sdkmanager --list_installed` |
| Android NDK | **r29 (`29.0.14206865`)** | `ls $ANDROID_HOME/ndk` |
| Gradle (wrapper) | **8.13** | در `gradle-wrapper.properties` تعریف می‌شود |
| فضای دیسک | حدود ۱۰ گیگابایت آزاد | `df -h` |
| RAM | ۸ گیگابایت یا بیشتر پیشنهاد می‌شود | `free -h` |

---

## ۴. گام ۱ — نصب ابزارهای اصلی (Node، pnpm، Rust)

یک ترمینال باز کنید و بلوک زیر را اجرا کنید. Node، pnpm و Rust را با `rustup` نصب می‌کند.

```bash
# --- Node.js (LTS) ---
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# --- pnpm ---
sudo npm install -g pnpm

# --- Rust + rustup ---
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"

# --- بررسی ---
node -v      # v20.x
pnpm -v      # 8.x یا 9.x
rustc --version
cargo --version
```

> **نکته برای ایران:** اگر `sh.rustup.rs` در دسترس نبود، از آینهٔ شکن استفاده کنید:
> ```bash
> export RUSTUP_DIST_SERVER="https://mirror-rustup.pkg.shecan.ir"
> export RUSTUP_UPDATE_ROOT="https://mirror-rustup.pkg.shecan.ir/rustup"
> ```

---

## ۵. گام ۲ — نصب وابستگی‌های ساخت Android

Tauri به **JDK 17**، **SDK Platform 35**، **Build-Tools 35.0.1**، **Platform-Tools** (`adb`) و **NDK r29** نیاز دارد. دو راه وجود دارد. بر اساس وضعیت شبکه یکی را انتخاب کنید:

- **راه A — `sdkmanager` (خودکار، آنلاین).** اگر `dl.google.com` در دسترس باشد سریع‌ترین راه است.
- **راه B — CSV مایکت (دستی، آفلاین / مقاوم در برابر تحریم).** وقتی `sdkmanager` گیر می‌کند، timeout می‌دهد یا 403 برمی‌گرداند از این روش استفاده کنید. مایکت همین روش را برای کاربران ایرانی مستند کرده است.

### ۵.۱ راه A — نصب خودکار با `sdkmanager`

```bash
# ============================================================
#  وابستگی‌های ساخت Android برای Tauri (روش آنلاین)
#  JDK 17  +  SDK 35  +  NDK 29  +  Build-Tools  +  ADB
# ============================================================

# 1. نصب JDK 17 (Tauri به 17 نیاز دارد؛ JDK 21 باعث خرابی Gradle می‌شود)
sudo apt update
sudo apt install -y openjdk-17-jdk
java -version                       # باید "17.x" نشان دهد

# 2. ساخت ساختار پوشهٔ Android SDK
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
mkdir -p "$ANDROID_HOME/cmdline-tools"

# 3. دانلود command-line tools گوگل
#    (اگر گوگل دسترسی را بست، آینهٔ ایرانی در پایان §۵ آمده است)
cd /tmp
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q commandlinetools-linux-*.zip -d "$ANDROID_HOME/cmdline-tools"
mv "$ANDROID_HOME/cmdline-tools/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"

# 4. افزودن sdkmanager به PATH برای همین نشست
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# 5. پذیرش خودکار همهٔ مجوزها
yes | sdkmanager --licenses

# 6. نصب دقیق بسته‌هایی که Tauri لازم دارد
sdkmanager \
  "platform-tools" \
  "platforms;android-35" \
  "build-tools;35.0.1" \
  "ndk;29.0.14206865"

# 7. بررسی
sdkmanager --list_installed | grep -E "platforms;android-35|build-tools;35.0.1|ndk;29.0.14206865|platform-tools"
adb version
```

### ۵.۲ راه B — نصب دستی با CSV مایکت (پیشنهادی برای ایران)

مایکت یک CSV منتشر کرده که هر بستهٔ SDK را با **لینک مستقیم روی `maven.myket.ir`** و **هش SHA-1** دارد. این روش `dl.google.com` را کاملاً دور می‌زند. ستون‌های CSV عبارت‌اند از:

| ستون | معنی |
|------|------|
| `package_path` | مسیر هدف داخل `$ANDROID_HOME` (مثلاً `platforms;android-35`) |
| `package_display_name` | نام خوانا |
| `package_revision` | شمارهٔ نسخه |
| `archive_url` | لینک دانلود مستقیم روی `maven.myket.ir` |
| `archive_size` | حجم به بایت |
| `archive_checksum` | هش **SHA-1** برای بررسی صحت |

چهار ردیفی که این راهنما واقعاً لازم دارد، از CSV:

| بسته | آرشیو | SHA-1 | حجم |
|------|-------|-------|------|
| `platforms;android-35` (r02) | `platform-35_r02.zip` | `0bb560a90a7a2cbd0dd8348224d518b638fe7949` | ~۶۴ MB |
| `build-tools;35.0.1` (Linux) | `build-tools_r35.0.1_linux.zip` | `e009a9b188cfeb1d2b4c318ab5cb4f1ddc368861` | ~۶۲ MB |
| `ndk;29.0.14206865` (Linux) | `android-ndk-r29-linux.zip` | `87e2bb7e9be5d6a1c6cdf5ec40dd4e0c6d07c30b` | ~۷۸۴ MB |
| `platform-tools` | *(در بخش دیده‌شدهٔ CSV نیست)* | — | — |

> **نکته دربارهٔ `platform-tools` و `cmdline-tools`:** CSV موجود شما تا `build-tools;36` بریده شده است. CSV کامل مایکت معمولاً ردیف‌های `platform-tools` را هم دارد — با `grep` دنبال `platform-tools;` بگردید. اگر نبود، `platform-tools` حجم کمی دارد (حدود ۵ مگابایت) و معمولاً هنوز از گوگل قابل دریافت است؛ با `sdkmanager "platform-tools"` نصبش کنید. خود `cmdline-tools` فقط برای `sdkmanager` لازم است؛ در روش دستی می‌توانید از آن صرف‌نظر کنید.

#### اسکریپت یکجا (با توضیح کامل)

```bash
#!/usr/bin/env bash
# ============================================================
#  نصب دستی Android SDK از CSV مایکت (Linux x86_64)
#  بسته‌ها: Platform 35، Build-Tools 35.0.1، NDK 29.0.14206865
#  هر دانلود با SHA-1 موجود در CSV بررسی می‌شود.
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
echo "$SHA  $FILE" | sha1sum -c -                 # بررسی صحت
unzip -q "$FILE" -d "$ANDROID_HOME/platforms/"
# zip مستقیماً به platforms/android-35/ استخراج می‌شود

# ---------- 2. Build-Tools 35.0.1 (Linux) ----------
URL="https://maven.myket.ir/android-sdk/build-tools_r35.0.1_linux.zip"
SHA="e009a9b188cfeb1d2b4c318ab5cb4f1ddc368861"
FILE="build-tools_r35.0.1_linux.zip"
[ -f "$FILE" ] || curl -L --retry 3 -O "$URL"
echo "$SHA  $FILE" | sha1sum -c -
rm -rf /tmp/bt-extract && mkdir -p /tmp/bt-extract
unzip -q "$FILE" -d /tmp/bt-extract
# zip دقیقاً یک پوشهٔ سطح‌بالا دارد؛ آن را بردار و تغییر نام بده
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

# ---------- 4. بررسی نهایی ----------
echo "--- platform ---";   ls "$ANDROID_HOME/platforms/android-35/android.jar"
echo "--- build-tools ---"; ls "$ANDROID_HOME/build-tools/35.0.1/aapt2"
echo "--- ndk ---";         ls -d "$ANDROID_HOME/ndk/29.0.14206865/toolchains"
echo "✅ نصب دستی SDK کامل شد."
```

آن را به‌صورت `~/install-sdk-myket.sh` ذخیره کنید، اجرایی کنید و اجرا کنید:

```bash
chmod +x ~/install-sdk-myket.sh
~/install-sdk-myket.sh
```

بعد از پایان، `sdkmanager --list_installed` این بسته‌ها را می‌شناسد، چون هر zip گوگل یک فایل `package.xml` / `source.properties` دارد که ابزار آن را می‌خواند.

> **اگر `platform-tools` در CSV نبود:** `sdkmanager "platform-tools"` را اجرا کنید (دانلود کوچک). اگر آن هم نشد، zip مربوط به Platform-Tools را از صفحهٔ مخزن گوگل بگیرید و مستقیم در `$ANDROID_HOME/platform-tools/` استخراج کنید.

---

## ۶. گام ۳ — ماندگار کردن مسیرها (این گام را رد نکنید)

ابزارهای Android باید در هر شل جدید دیده شوند. موارد زیر را به `~/.bashrc` (یا `~/.zshrc`) اضافه کنید:

```bash
# ===== محیط Android / Tauri =====
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export NDK_HOME="$ANDROID_HOME/ndk/29.0.14206865"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
export PATH="$NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin:$PATH"
```

شل را دوباره بارگذاری کنید و همهٔ مسیرها را بررسی کنید:

```bash
source ~/.bashrc
echo $ANDROID_HOME      # /home/<you>/Android/Sdk
which adb               # .../platform-tools/adb
ls $NDK_HOME            # ndk-build, toolchains, ...
```

---

## ۷. گام ۴ — ساختار پوشه‌ها (دقیقاً همان‌طور که مایکت مستند کرده است)

ساختار رسمی SDK مایکت همان ساختاری است که `sdkmanager` گوگل تولید می‌کند. چه از راه A استفاده کرده باشید چه از راه B، `$ANDROID_HOME` شما باید در نهایت این‌گونه باشد:

```
$HOME/Android/Sdk/
├── build-tools/
│   └── 35.0.1/                ← از build-tools_r35.0.1_linux.zip استخراج شده
│       ├── aapt2
│       ├── apksigner          ← برای امضا از این استفاده می‌کنید
│       ├── zipalign
│       └── package.xml
├── cmdline-tools/
│   └── latest/
│       └── bin/
│           └── sdkmanager
├── emulator/                  ← اختیاری
├── ndk/
│   └── 29.0.14206865/         ← از android-ndk-r29/ تغییر نام داده شده
│       └── toolchains/llvm/prebuilt/linux-x86_64/bin/
│           ├── aarch64-linux-android21-clang
│           └── ...
├── platform-tools/
│   └── adb
└── platforms/
    └── android-35/            ← از platform-35_r02.zip استخراج شده
        ├── android.jar
        └── package.xml
```

**نگاشت ستون `package_path` در CSV به پوشهٔ روی دیسک:**

| `package_path` در CSV | پوشهٔ واقعی در `$ANDROID_HOME` |
|------------------------|--------------------------------|
| `platforms;android-35` | `platforms/android-35/` |
| `build-tools;35.0.1` | `build-tools/35.0.1/` |
| `ndk;29.0.14206865` | `ndk/29.0.14206865/` |
| `platform-tools` | `platform-tools/` |

> **چرا تغییر نام مهم است:** zipهای Build-Tools گوگل به پوشه‌ای به نام *release* استخراج می‌شوند (مثلاً `android-15/`) و zipهای NDK به `android-ndk-r29/`. `sdkmanager` معمولاً این تغییر نام را خودکار انجام می‌دهد. وقتی دستی استخراج می‌کنید، **باید به شمارهٔ نسخه تغییر نام دهید** وگرنه Gradle ابزارها را پیدا نمی‌کند.

وقتی پروژهٔ Tauri می‌سازید، **پروژهٔ Android تولیدشده** داخل برنامهٔ شماست، نه داخل SDK:

```
your-tauri-app/
└── src-tauri/
    └── gen/
        └── android/
            ├── app/                     ← ماژول برنامهٔ Android
            ├── gradle/wrapper/
            │   └── gradle-wrapper.properties   ← Gradle 8.13 اینجا pin شده است
            ├── settings.gradle          ← آینه‌ها را اینجا اضافه می‌کنید
            ├── build.gradle
            └── keystore.properties      ← برای امضا این را می‌سازید
```

---

## ۸. گام ۵ — آینه‌های ایرانی (لایهٔ مقاوم در برابر تحریم)

حتی با نصب SDK از مایکت، Gradle همچنان سعی می‌کند آرتیفکت‌های Android Gradle Plugin را از `dl.google.com` و `repo.maven.apache.org` بگیرد. تنظیمات زیر هر درخواست را به آینهٔ ایرانی هدایت می‌کند. خود آرشیوهای SDK روی `maven.myket.ir` هستند (همان میزبانی که اسکریپت CSV استفاده می‌کند)، بنابراین زیرساخت آینه‌ها یکدست است.

### ۸.۱ آینهٔ سراسری Gradle — `~/.gradle/init.gradle`

این فایل آینه‌ها را روی **همهٔ پروژه‌های Gradle** اعمال می‌کند. آن را بسازید:

```bash
mkdir -p ~/.gradle
nano ~/.gradle/init.gradle
```

دقیقاً زیر را بچسبانید:

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

**چرا این ترتیب؟** Runflare و Shecan سریع‌ترین آینه‌های ایرانی‌اند؛ Myket و DevNeeds روی Android تمرکز دارند؛ Jamko و IranRepo جایگزین‌های پشتیبان‌اند؛ Aliyun (چین) وقتی آینه‌های ایرانی پایین‌اند کمک می‌کند؛ مخزن‌های رسمی آخرین گزینه‌اند.

### ۸.۲ آینهٔ هر پروژه — `src-tauri/gen/android/settings.gradle`

`init.gradle` سراسری بیشتر حالت‌ها را پوشش می‌دهد، اما پروژهٔ تولیدشدهٔ Tauri از `dependencyResolutionManagement` با `PREFER_SETTINGS` استفاده می‌کند. باید `settings.gradle` سطح پروژه را هم ویرایش کنید:

```bash
# این را بعد از ساخت پروژهٔ Tauri اجرا کنید (گام ۱۰)
nano src-tauri/gen/android/settings.gradle
```

محتوای آن را با این جایگزین کنید:

```groovy
pluginManagement {
    repositories {
        maven { url = uri("https://mirror-maven.runflare.com/android/maven2/") }
        maven { url = uri("https://mirror-maven.runflare.com/maven2/") }
        maven { url = uri("https://mirror-maven.runflare.com/gradle-plugins/") }
        maven { url = uri('https://mirror-maven.pkg.shecan.ir/gradle-plugins') }

        // مایکت — بالاترین اولویت برای آرتیفکت‌های Android
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

### ۸.۳ توزیع Gradle Wrapper — پین کردن ۸.۱۳ روی شکن

پروژهٔ تولیدشدهٔ Tauri نسخهٔ Gradle 8.13 را پین می‌کند. wrapper را به آینهٔ شکن اشاره دهید تا دانلود توزیع گیر نکند:

```bash
nano src-tauri/gen/android/gradle/wrapper/gradle-wrapper.properties
```

خط `distributionUrl` را این‌گونه تنظیم کنید:

```properties
distributionUrl=https://mirror-gradle.pkg.shecan.ir/distributions/gradle-8.13-bin.zip
```

فایل کامل باید شبیه این باشد:

```properties
distributionBase=GRADLE_USER_HOME
distributionUrl=https://mirror-gradle.pkg.shecan.ir/distributions/gradle-8.13-bin.zip
distributionPath=wrapper/dists
zipStorePath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
```

### ۸.۴ آینهٔ Cargo — `~/.cargo/config.toml`

crateهای Rust از طریق **sparse index** گرفته می‌شوند. شکن یک آینهٔ سریع ایرانی دارد:

```bash
nano ~/.cargo/config.toml
```

```toml
[source.crates-io]
replace-with = "shecan"

[source.shecan]
registry = "sparse+https://mirror-cargo.pkg.shecan.ir/index/"
```

بررسی:

```bash
cargo search serde   # باید سریع نتیجه بدهد
```

---

## ۹. گام ۶ — بهینه‌سازی Cargo برای حجم (`Cargo.toml`)

ساخت release پیش‌فرض شامل نمادهای اشکال‌زدایی است و برای حجم بهینه نیست. این را به `src-tauri/Cargo.toml` **پروژه** اضافه کنید:

```toml
[profile.release]
opt-level = "s"      # بهینه‌سازی برای حجم، نه سرعت
lto = true           # بهینه‌سازی زمان لینک
codegen-units = 1    # بهینه‌سازی بهتر (کامپایل کندتر)
panic = "abort"      # باینری کوچک‌تر، بدون جدول‌های unwinding
strip = true         # حذف نمادها
```

همین ترکیب است که **APK arm64 را به حدود ۱۱ مگابایت** می‌رساند، نه ۴۰ تا ۵۰ مگابایت.

---

## ۱۰. گام ۷ — ساخت و اجرای برنامهٔ Tauri

### ۱۰.۱ ساخت برنامهٔ جدید

```bash
pnpm create tauri-app
```

انتخاب کنید:

- **نام پروژه:** `my-tauri-app`
- **زبان فرانت‌اند:** TypeScript / JavaScript
- **مدیر بسته:** pnpm
- **قالب UI:** React (یا انتخاب خودتان)
- **نوع UI:** TypeScript

```bash
cd my-tauri-app
pnpm install
```

### ۱۰.۲ افزودن هدف Android به Rust

```bash
rustup target add aarch64-linux-android
rustup target list --installed | grep aarch64-linux-android
```

### ۱۰.۳ مقداردهی اولیهٔ پروژهٔ Android

```bash
pnpm tauri android init
```

این کار `src-tauri/gen/android/` را می‌سازد. **حالا به بخش‌های ۸.۲ و ۸.۳ برگردید** و آینه‌های سطح پروژه و آدرس Gradle wrapper را وارد کنید.

### ۱۰.۴ توسعهٔ دسکتاپ (بررسی سلامت)

```bash
pnpm tauri dev
```

یک پنجرهٔ بومی دسکتاپ باز می‌شود. بک‌اند Rust اجرا می‌شود و فرانت‌اند توسط Vite سرو می‌شود. اگر این مرحله شکست خورد، به Android نروید — اول ساخت دسکتاپ را درست کنید.

---

## ۱۱. گام ۸ — توسعهٔ Android و `adb reverse` حیاتی

### ۱۱.۱ آماده‌سازی گوشی

روی دستگاه Android:

1. **Developer Options** را فعال کنید (۷ بار روی *Build Number* بزنید).
2. **USB Debugging** را فعال کنید.
3. با USB وصل شوید و به کامپیوتر اجازه دهید.

بررسی:

```bash
adb devices
# List of devices attached
# ABC123456789    device
```

اگر دستگاه `unauthorized` نشان داد، در گوشی مجوزهای USB debugging را لغو و دوباره وصل کنید.

### ۱۱.۲ نیاز به `adb reverse`

سرور توسعهٔ Vite روی **ماشین اوبونتو** شما در `localhost:1420` اجرا می‌شود. گوشی نمی‌تواند به `localhost` شما برسد. باید پورت را reverse کنید:

```bash
adb reverse tcp:1420 tcp:1420
```

همچنین Vite باید روی همهٔ اینترفیس‌ها گوش دهد. `vite.config.ts` (یا `.js`) را ویرایش کنید:

```ts
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 1420,
    strictPort: true,
  },
  // ... بقیهٔ تنظیمات
});
```

### ۱۱.۳ اجرای حالت توسعهٔ Android

```bash
pnpm tauri android dev --host 0.0.0.0
```

این کار بک‌اند Rust را برای ARM64 کامپایل می‌کند، APK دیباگ را روی گوشی وصل‌شده نصب می‌کند و فرانت‌اند را hot-reload می‌کند. **این همان حالتی است که باید در توسعهٔ روزمره استفاده کنید.**

---

## ۱۲. گام ۹ — ساخت APK انتشار (فقط aarch64)

### ۱۲.۱ از `--debug` برای انتشار استفاده نکنید

> **هشدار مهم:** `pnpm tauri android build --debug` یک APK حدود **۵۰۰ مگابایتی** می‌سازد، چون پروفایل `dev` در Rust نمادهای اشکال‌زدایی و بدون بهینه‌سازی دارد. برای توزیع بی‌فایده است و وقت تلف می‌کند.

### ۱۲.۲ دستور درست

```bash
pnpm tauri android build --apk --target aarch64
```

چرا `aarch64`؟

- `aarch64` به ABI اندروید **`arm64-v8a`** نگاشت می‌شود که **تقریباً همهٔ گوشی‌های مدرن** (از ۲۰۱۸ به بعد) را پوشش می‌دهد.
- ساخت **همهٔ هدف‌ها** (armv7، x86، x86_64) حجم APK را به **۱۵۰ تا ۲۰۰ مگابایت** می‌رساند و ساخت را کند می‌کند.

### ۱۲.۳ محل خروجی

APK اینجا ساخته می‌شود:

```
src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

حجم مورد انتظار: **حدود ۱۱ مگابایت** (با پروفایل اندازهٔ Cargo از گام ۹).

### ۱۲.۴ بررسی معماری دستگاه (قبل از ساخت)

اگر مطمئن نیستید گوشی `arm64-v8a` است:

```bash
adb shell getprop ro.product.cpu.abi
```

خروجی‌های معمول:

- `arm64-v8a` → از `--target aarch64` استفاده کنید ✅
- `armeabi-v7a` → از `--target armv7` استفاده کنید (دستگاه‌های قدیمی‌تر)
- `x86_64` → فقط شبیه‌ساز

برای فهرست کامل ABIهای پشتیبانی‌شده:

```bash
adb shell getprop ro.product.cpu.abilist
```

---

## ۱۳. گام ۱۰ — امضای APK (برای نصب اجباری است)

APK انتشار بدون امضا **روی دستگاه واقعی نصب نمی‌شود**. Android به امضای معتبر نیاز دارد. Tauri از امضای استاندارد Java keystore پشتیبانی می‌کند.

### ۱۳.۱ ساخت Keystore (یک‌بار)

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

این فایل را **مطمئن و پشتیبان‌گیری‌شده** نگه دارید. از دست دادنش یعنی نمی‌توانید برنامه را در مارکت‌ها به‌روزرسانی کنید.

### ۱۳.۲ ساخت `keystore.properties`

داخل پروژهٔ تولیدشدهٔ Android:

```bash
nano src-tauri/gen/android/keystore.properties
```

```properties
storeFile=/home/YOUR_USER/my-release-key.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=my-key-alias
keyPassword=YOUR_KEY_PASSWORD
```

> `YOUR_USER` را با نام کاربری واقعی لینوکس جایگزین کنید. از مسیر مطلق استفاده کنید.

### ۱۳.۳ امضا با `apksigner`

Gradle ممکن است در صورت وجود `keystore.properties` خودکار امضا کند، اما همیشه می‌توانید دستی با `apksigner` مربوط به SDK امضا کنید:

```bash
APK="src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk"
BUILD_TOOLS="$ANDROID_HOME/build-tools/35.0.1"

# اول align (قبل از امضا لازم است)
"$BUILD_TOOLS/zipalign" -v 4 "$APK" /tmp/app-aligned.apk

# امضا
"$BUILD_TOOLS/apksigner" sign \
  --ks ~/my-release-key.keystore \
  --ks-key-alias my-key-alias \
  --ks-pass pass:YOUR_STORE_PASSWORD \
  --key-pass pass:YOUR_KEY_PASSWORD \
  --out /tmp/app-signed.apk \
  /tmp/app-aligned.apk

# بررسی
"$BUILD_TOOLS/apksigner" verify --verbose /tmp/app-signed.apk
```

ابزار `apksigner` طرح‌های امضای APK v2/v3 + v4 را اعمال می‌کند که نسخه‌های مدرن Android و مارکت‌ها لازم دارند.

### ۱۳.۴ نصب APK امضاشده

```bash
adb install /tmp/app-signed.apk
```

---

## ۱۴. دستورهای مهم — مرجع سریع

| دستور | چه می‌کند | چه وقت استفاده شود |
|-------|-----------|---------------------|
| `pnpm tauri dev` | یک **پنجرهٔ دسکتاپ** با بک‌اند Rust + فرانت‌اند Vite باز می‌کند. نسخهٔ فقط مرورگر کار نمی‌کند چون لایهٔ IPC Rust وجود ندارد. | توسعهٔ دسکتاپ و تست منطق. |
| `pnpm tauri android dev --host 0.0.0.0` | یک **APK دیباگ** روی گوشی وصل‌شده با USB می‌سازد و نصب می‌کند، با hot-reload فرانت‌اند. نیاز به `adb reverse tcp:1420 tcp:1420` و Vite با `host: "0.0.0.0"` دارد. | توسعهٔ روزمرهٔ Android. **این حالت مورد نظر شماست.** |
| `pnpm tauri android build --debug` | ⛔ **پرهیز کنید.** APK دیباگ حدود ۵۰۰ مگابایت با نمادها می‌سازد. برای توزیع بی‌فایده است. | هرگز، مگر برای اشکال‌زدایی crashهای بومی. |
| `pnpm tauri android build --apk --target aarch64` | ✅ **دستور انتشار.** APK یونیورسال حدود ۱۱ مگابایت در `.../apk/universal/release/app-universal-release.apk` می‌سازد. | ساخت نهایی برای مایکت، بازار یا نصب مستقیم. |
| `adb devices` | دستگاه‌های وصل‌شده را فهرست می‌کند. | قبل از هر `android dev` یا `install`. |
| `adb reverse tcp:1420 tcp:1420` | `localhost:1420` گوشی را به سرور Vite کامپیوتر شما فوروارد می‌کند. | هر بار که گوشی را در حالت توسعه دوباره وصل می‌کنید. |
| `adb shell getprop ro.product.cpu.abi` | ABI دستگاه را چاپ می‌کند (`arm64-v8a`، `armeabi-v7a`، `x86_64`). | قبل از انتخاب هدف ساخت. |
| `adb shell getprop ro.product.cpu.abilist` | **همهٔ** ABIهای پشتیبانی‌شده را فهرست می‌کند. | برای بررسی دقیق معماری. |
| `sdkmanager --list_installed` | بسته‌های نصب‌شدهٔ SDK/NDK را نشان می‌دهد. | عیب‌یابی platformهای گم‌شده. |
| `sha1sum -c` | دانلود CSV مایکت را بررسی می‌کند. | بعد از هر استخراج دستی CSV. |

---

## ۱۵. خلاصه — گردش‌کار کامل

کل فرآیند در یک چک‌لیست فشرده شده است. از بالا به پایین دنبال کنید.

1. **نصب ابزارهای اصلی:** Node 20، pnpm، Rust با `rustup`.
2. **نصب پشتهٔ Android — یکی را انتخاب کنید:**
   - **راه A (آنلاین):** JDK 17 + `sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.1" "ndk;29.0.14206865"`.
   - **راه B (CSV مایکت، آفلاین):** اسکریپت §۵.۲ را اجرا کنید — `platform-35_r02.zip`، `build-tools_r35.0.1_linux.zip` و `android-ndk-r29-linux.zip` را از `maven.myket.ir` دانلود می‌کند، هر SHA-1 را از CSV بررسی می‌کند و زیر `$ANDROID_HOME` با نام پوشهٔ درست نسخه (`platforms/android-35/`، `build-tools/35.0.1/`، `ndk/29.0.14206865/`) قرار می‌دهد.
3. **ماندگار کردن مسیرها:** `ANDROID_HOME`، `NDK_HOME` و `PATH` در `~/.bashrc` (گام ۶).
4. **تنظیم آینه‌های ایرانی:**
   - `~/.gradle/init.gradle` (Gradle سراسری)
   - `src-tauri/gen/android/settings.gradle` (Gradle هر پروژه، بعد از `android init`)
   - `gradle-wrapper.properties` → Gradle 8.13 شکن
   - `~/.cargo/config.toml` → sparse index شکن
5. **بهینه‌سازی `Cargo.toml`:** `opt-level="s"`، `lto=true`، `codegen-units=1`، `panic="abort"`، `strip=true`.
6. **ساخت برنامه:** `pnpm create tauri-app` → `pnpm install` → `rustup target add aarch64-linux-android` → `pnpm tauri android init`.
7. **بررسی دسکتاپ:** `pnpm tauri dev` یک پنجره باز می‌کند.
8. **توسعهٔ Android:** فعال‌سازی USB debugging → `adb devices` → `adb reverse tcp:1420 tcp:1420` → `pnpm tauri android dev --host 0.0.0.0`.
9. **ساخت انتشار:** `pnpm tauri android build --apk --target aarch64`.
10. **امضا:** ساخت keystore → `keystore.properties` → `zipalign` + `apksigner` → بررسی.
11. **نصب/توزیع:** `adb install` برای تست، یا آپلود APK امضاشده در مایکت/بازار.

---

## سخن پایانی

Tauri به توسعه‌دهندگان ایرانی یک مزیت کم‌یاب می‌دهد: یک **خط تولید کاملاً محلی، مقاوم در برابر تحریم و چندسکویی** که باینری‌های کوچک تولید می‌کند. دو نقطهٔ اصطکاک — تهیهٔ SDK و حل وابستگی‌های Maven — هر دو در بالا حل شده‌اند. **راه B (§۵.۲)** قوی‌ترین گزینه است: `dl.google.com` را با `maven.myket.ir` جایگزین می‌کند، هر آرشیو را با SHA-1 مایکت بررسی می‌کند و دقیقاً همان چیدمان روی دیسک گوگل را بازتولید می‌کند تا Gradle تفاوتی احساس نکند. آن را با آینه‌های شکن/Runflare/مایکت در §۸ ترکیب کنید تا کل زنجیرهٔ ابزار — از crateهای Rust تا JARهای پلتفرم Android — روی خاک ایران بماند.

keystore خود را پشتیبان بگیرید، آینه‌ها را به‌روز نگه دارید و چیزهایی بسازید که اهمیت دارند.
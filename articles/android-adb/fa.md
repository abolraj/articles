---
title: مرجع کامل دستورات ADB برای توسعه‌ی اندروید
date: 2026-11-21
excerpt: ADB برای توسعه‌ی اندروید
---

# مرجع کامل دستورات ADB برای توسعه‌ی اندروید

Android Debug Bridge یا همان ADB، مهم‌ترین ابزار خط فرمان در جعبه‌ابزار هر توسعه‌دهنده‌ی اندروید است. فرقی نمی‌کند در حال دیباگ کردن کرشی هستید که فقط روی دستگاه واقعی رخ می‌دهد، می‌خواهید جریان permission را بدون رد شدن از پنج منو تست کنید، یا یک UI test را خودکار کنید — ADB راه شما برای صحبت مستقیم با دستگاه است.

این مقاله یک مرجع عملی و میدانی است. بر اساس کاری که می‌خواهید انجام دهید سازمان‌دهی شده و هر دستور به این دلیل انتخاب شده که واقعاً به کارتان می‌آید، نه صرفاً یک نکته‌ی جالب.

---

## ۱. اتصال به دستگاه‌ها

قبل از هر کاری باید ببینید چه دستگاه‌هایی متصل هستند و وقتی بیش از یکی وصل است، بتوانید هدف را مشخص کنید.

```bash
adb devices
```

این «سلام دنیا»ی ADB است. خروجی، هر دستگاه متصل را با یک شماره سریال و یک وضعیت نشان می‌دهد — `device` (آماده)، `offline` (پاسخ نمی‌دهد)، یا `unauthorized` (هنوز روی گوشی «Allow» را نزده‌اید).

وقتی چند دستگاه وصل است، هر دستوری را با `-s` مشخص کنید:

```bash
adb -s emulator-5554 install app.apk
adb -s R58M12345 shell
```

**Wireless debugging** (اندروید ۱۱ و بالاتر) دو مرحله دارد:

```bash
adb pair <device-ip>:<pair-port>     # کد نمایش‌داده‌شده روی گوشی را وارد کنید
adb connect <device-ip>:5555
```

اگر ADB به وضعیت عجیبی افتاد و دستگاه‌ها ناپدید شدند یا دستورات هنگ کردند، سرور را ری‌استارت کنید:

```bash
adb kill-server
adb start-server
```

این کار اکثر مشکلات «ADB خراب شده» را حل می‌کند.

---

## ۲. نصب، حذف و بررسی اپلیکیشن‌ها

```bash
adb install path/to/app.apk           # نصب یک debug build
adb install -r app.apk                # نصب مجدد، حفظ داده‌های اپ
adb install -d app.apk                # اجازه‌ی downgrade
adb uninstall com.example.app         # حذف با نام پکیج
adb uninstall -k com.example.app      # حذف ولی نگه‌داشتن داده‌ها
```

دقت کنید که `uninstall` **نام پکیج** را می‌گیرد، نه نام فایل APK را. اگر فقط APK را دارید و نام پکیج را نمی‌دانید:

```bash
aapt dump badging app.apk | head -1
```

برای فهرست پکیج‌های نصب‌شده:

```bash
adb shell pm list packages              # همه‌ی پکیج‌ها
adb shell pm list packages -3           # فقط third-party (نصب‌شده توسط کاربر)
adb shell pm list packages -s           # فقط پکیج‌های سیستمی
adb shell pm list packages | grep cook  # جستجو با کلیدواژه
```

برای پاک کردن داده‌های یک اپ (معادل «Clear storage» در Settings) که برای تست حالت نصب تازه مفید است:

```bash
adb shell pm clear com.example.app
```

برای force-stop یک اپ در حال اجرا:

```bash
adb shell am force-stop com.example.app
```

---

## ۳. Logcat — شریان حیات دیباگر

`logcat` جایی است که بیشترین وقت را در آن می‌گذرانید، و همچنین جایی که بیشتر افراد گم می‌شوند، چون یک `adb logcat` خالی، هزاران خط در ثانیه بیرون می‌دهد. ترفند یادگیری **سینتکس filter** است.

### فرمت filter

هر filter شکل `<tag>:<priority>` دارد. Priority‌ها یک حرف هستند:

| حرف | Priority  |
|-----|-----------|
| `V` | Verbose   |
| `D` | Debug     |
| `I` | Info      |
| `W` | Warning   |
| `E` | Error     |
| `F` | Fatal     |
| `S` | Silent    |

### دو موردی که ۹۰٪ وقت‌ها استفاده می‌کنید

**فقط نمایش خطاها:**

```bash
adb logcat '*:E'
```

علامت `*` یعنی «همه‌ی تگ‌ها» و `:E` یعنی «Priority برابر Error و بالاتر». این سریع‌ترین راه دیدن این است که واقعاً چه چیزی خراب شده، بدون اسکرول کردن در شلوغی سیستم. **همیشه filter را در single quote بگذارید** — وگرنه `*` توسط bash glob-expand می‌شود و ADB آشغال دریافت می‌کند.

**نمایش یک تگ از Info به بالا، بقیه سایلنت:**

```bash
adb logcat 'MyTag:I *:S'
```

این همان الگوی کلاسیک «همه را سایلنت کن، بعد whitelist کن» است. `*:S` در انتها همه‌ی تگ‌های دیگر را Silent می‌کند تا فقط پیام‌های `MyTag` باقی بمانند. **به single quote دقت کنید** — دقیقاً همان الگوی «ترکیب filterها داخل quote» است که افراد را به اشتباه می‌اندازد. بدون quote، shell آن را خراب می‌کند.

می‌توانید هر تعداد تگ که خواستید زنجیره کنید:

```bash
adb logcat 'ActivityManager:I MyApp:D *:S'
```

### سایر فراخوانی‌های مفید logcat

```bash
adb logcat -c                         # پاک کردن بافر (قبل از بازتولید باگ بزنید)
adb logcat -d                         # بافر را dump کن و خارج شو (غیرتعاملی)
adb logcat -b crash                   # فقط بافر crash
adb logcat -b main -b system          # بافرهای مشخص
adb logcat -v time                    # هر خط با timestamp
adb logcat -v color                   # رنگ ANSI بر اساس priority (عالی برای ترمینال)
```

### فیلتر بر اساس PID — روش دقیق

وقتی می‌خواهید همه‌چیزِ اپتان را ببینید (نه فقط خطاها)، بر اساس process ID فیلتر کنید:

```bash
adb logcat --pid=$(adb shell pidof -s com.example.app)
```

این وقتی حیاتی است که اپ crash می‌کند و می‌خواهید لحظات آخرش را ببینید. عیبش این است که باید PID را قبل از مرگ پروسه بگیرید، پس برای تشخیص طولانی‌مدت مناسب است، نه برای کرش‌های لحظه‌ای.

### جریان کاری برای crash

اگر اپی بلافاصله بعد از باز شدن crash می‌کند، ترفند این است که logcat **قبل از** تپ کردن آیکون در حال ضبط باشد:

```bash
adb logcat -c                                              # صفحه‌ی سفید
adb logcat -v time > crash.txt &                           # ضبط در فایل
# ... اپ را روی دستگاه باز کنید ...
# ... منتظر crash بمانید ...
kill %1                                                    # توقف ضبط
grep -A 20 'FATAL EXCEPTION' crash.txt                     # پیدا کردن crash
```

بلوکی که با `FATAL EXCEPTION` شروع می‌شود همان چیزی است که می‌خواهید. آن را **از پایین به بالا** در خطوط `Caused by:` بخوانید — آخری تقریباً همیشه علت ریشه‌ای است.

---

## ۴. عملیات فایل

```bash
adb push local.txt /sdcard/                 # کامپیوتر → دستگاه
adb pull /sdcard/file.txt ./                # دستگاه → کامپیوتر
adb pull /sdcard/DCIM/ ./photos/            # pull بازگشتی یک پوشه
adb shell ls /sdcard/                       # فهرست فایل‌های دستگاه
```

اسکرین‌شات‌ها و ویدیوهایی که روی دستگاه می‌گیرید در `/sdcard/DCIM/` یا `/sdcard/Pictures/` هستند، پس `adb pull` راه گرفتن آن‌هاست.

---

## ۵. shell، شبیه‌سازی ورودی و اطلاعات دستگاه

```bash
adb shell                                   # shell تعاملی روی دستگاه
adb shell ps                                # پروسه‌های در حال اجرا
adb shell top                               # مصرف لحظه‌ای CPU/حافظه
adb shell dumpsys battery                   # وضعیت باتری
adb shell getprop ro.product.model          # مدل دستگاه
adb shell getprop ro.build.version.release  # نسخه‌ی اندروید
adb shell wm size                           # رزولوشن صفحه
```

### شبیه‌سازی ورودی کاربر

این‌طور تعاملات UI را اسکریپت می‌کنید و بدون لمس گوشی باگ بازتولید می‌کنید:

```bash
adb shell input tap 500 500                 # تپ در X=500, Y=500
adb shell input swipe 200 800 200 200       # swipe به بالا (از پایین به بالا)
adb shell input text "hello world"          # تایپ متن
adb shell input keyevent 26                 # Power
adb shell input keyevent 3                  # Home
adb shell input keyevent 4                  # Back
adb shell input keyevent 66                 # Enter
```

توجه: `input text` در همه‌ی نسخه‌های اندروید با فاصله خوب کار نمی‌کند — اگر به مشکل خوردید، به‌جای فاصله از `%s` استفاده کنید:

```bash
adb shell input text "hello%sworld"
```

### سایر یک‌خطی‌های قدرت‌مند shell

**گرفتن اسکرین‌شات مستقیم روی کامپیوتر** (بدون فایل میانی روی دستگاه):

```bash
adb exec-out screencap -p > screenshot.png
```

**ضبط صفحه:**

```bash
adb shell screenrecord /sdcard/video.mp4    # با Ctrl+C متوقف کنید
adb shell screenrecord --time-limit 30 /sdcard/video.mp4
```

**شبیه‌سازی شرایط باتری** (عالی برای تست رفتار power-save):

```bash
adb shell dumpsys battery set level 1        # باتری ۱٪
adb shell dumpsys battery unplug             # ادای unplugged بودن
adb shell dumpsys battery reset              # برگرداندن مقادیر واقعی
```

**اجبار به Doze mode** برای دیدن رفتار اپ در حالت ذخیره‌سازی شدید باتری:

```bash
adb shell dumpsys deviceidle force-idle
```

---

## ۶. Permissions و استخراج APK

**دادن یا گرفتن runtime permission** بدون رد شدن از Settings:

```bash
adb shell pm grant com.example.app android.permission.CAMERA
adb shell pm revoke com.example.app android.permission.CAMERA
```

**استخراج APK نصب‌شده** از دستگاه — وقتی می‌خواهید ببینید آنچه واقعاً اجرا می‌شود چیست:

```bash
adb pull $(adb shell pm path com.example.app | cut -d: -f2) ./app.apk
```

**دیدن permission‌هایی که یک اپ نصب‌شده اعلام می‌کند:**

```bash
adb shell dumpsys package com.example.app | grep -A 5 "requested permissions"
```

---

## ۷. ابزارهای عملکرد و دیباگ

**تماشای حافظه‌ی اپ** در یک حلقه:

```bash
adb shell "watch -n 1 'dumpsys meminfo com.example.app | grep TOTAL'"
```

double quote اینجا مهم است — دستور داخلش باید سالم به shell دستگاه برسد.

**Port forwarding** — سروری که داخل دستگاه اجرا می‌شود را روی ماشین میزبان خودتان در دسترس قرار می‌دهد:

```bash
adb forward tcp:8080 tcp:8080
```

الان `http://localhost:8080` روی کامپیوترتان با `localhost:8080` روی دستگاه صحبت می‌کند. مفید برای دیباگ in-app web serverها یا proxy کردن ترافیک.

**دیدن activity back stack:**

```bash
adb shell dumpsys activity activities | grep -E "Hist|mResumed"
```

**دیدن این‌که چه چیزی wakelock را نگه داشته:**

```bash
adb shell dumpsys power | grep -i wake
```

---

## ۸. کارت مرجع سریع

اینجا یک چیت‌شیت فشرده از دستوراتی که بیشترین استفاده را دارید:

```bash
# اتصال
adb devices
adb -s <serial> <command>
adb kill-server && adb start-server

# نصب و مدیریت
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

# فایل‌ها
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

## ۹. سه عادتی که ADB را ماندگار می‌کند

اگر فقط یک چیز از این مقاله ببرید، این سه عادت را درونی کنید:

۱. **همیشه filterهای logcat را quote کنید.** `'*:E'` و `'MyTag:I *:S'` — single quoteها اختیاری نیستند. بدونشان bash علامت `*` را glob-expand می‌کند و چیز بی‌معنی می‌گیرید.

۲. **قبل از بازتولید باگ، بافر را پاک کنید.** اول `adb logcat -c`، بعد باگ را trigger کنید، بعد بخوانید. وگرنه در نویزی که مربوط به قبل از شروع شماست جستجو می‌کنید.

۳. **در فایل ضبط کنید، بعد grep کنید.** وقتی باگ یک crash است، `adb logcat -v time > crash.txt` و سپس `grep -A 20 'FATAL EXCEPTION' crash.txt` سریع‌تر و قابل‌اعتمادتر از تلاش برای دیدن exception در حال اسکرول است.

بعد از یک هفته کار با ADB، ترمینال سریع‌ترین راه تعامل با دستگاه می‌شود — سریع‌تر از UI اندروید استودیو، سریع‌تر از تپ کردن در صفحه‌ها. دستورات بالا همان ۲۰٪ی هستند که ۸۰٪ کار دیباگ واقعی را پوشش می‌دهند.

---

*ترفند ADB محبوبی دارید که اینجا نیست؟ بهترین‌ها همیشه از history ترمینال یک نفر دیگر بیرون می‌آیند.*
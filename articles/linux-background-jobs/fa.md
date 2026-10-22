---
title: کارهای پسزمینه در لینوکس
date: 2026-10-22
excerpt: کارهای پسزمینه و systemd: یک راهنمای کاربردی
---

# کارهای پسزمینه و systemd: یک راهنمای کاربردی

## چرا این موضوع اهمیت دارد

فرایندی که با `&` اجرا میشود، تا زمانی که ترمینال باز است بینقص کار میکند. اسکریپتی که در `nohup` پیچیده شده، تا وقتی که روی یک فراخوانی شبکه معلق نمانده و هیچچیز دوباره راهاندازیاش نکند، درست اجرا میشود. هیچکدام از این دو ابزار هنگام شکست، هیچ گزارشی نمیدهند.

در اینجا دو مسئلهی متمایز حل میشود:

1. **اجرای چیزی در پسزمینه** — دغدغهای در سطح شل، که با کنترل job مدیریت میشود.
2. **مدیریت یک سرویس طولانیمدت** — دغدغهای در سطح سیستم، که با یک init system مدیریت میشود.

اشتباه گرفتن این دو، بیشتر شگفتیهای عملیاتیای را ایجاد میکند که هنگام کار با فرایندهای پسزمینه پیش میآید. این مقاله هر دو را پوشش میدهد؛ از ابتداییترین ابزارها شروع میکند تا رفتار ابزارهای سطح بالاتر معنادار شود، و سپس بیشتر حجم خود را به `systemctl` اختصاص میدهد، چون همان چیزی است که سرویسها را روی تقریباً هر توزیع مدرن لینوکس مدیریت میکند.

---

# بخش ۱ — کنترل job: مبانی

## ۱.۱ عملگر `&`

برای اجرای یک دستور در پسزمینه، `&` را به آن اضافه کنید:

```bash
sleep 300 &
```

```
[1] 48213
```

دو شناسهی متفاوت:

- `[1]` — **شمارهی job**، که شل فعلی اختصاص میدهد. محلی برای همان نشست شل است؛ یک ترمینال جدید دوباره از `[1]` شروع میکند.
- `48213` — **PID**، که کرنل اختصاص میدهد. سراسری است.

یک *job* مفهومی در سطح شل است. یک *فرایند* مفهومی در سطح کرنل است. `jobs`، `fg` و `bg` روی jobها کار میکنند؛ `kill` و `ps` روی PIDها. هر دو اهمیت دارند.

هنگام بسته شدن ترمینال چه اتفاقی میافتد: کرنل سیگنال `SIGHUP` را به شل میفرستد، و شل آن را به jobهایش ارسال میکند. فرایند پسزمینهای که با `&` اجرا شده، آن را دریافت کرده و خاتمه مییابد، مگر اینکه سیگنال را نادیده بگیرد — و این دقیقاً همان کاری است که `nohup` ترتیب میدهد.

## ۱.۲ `jobs` — فهرست jobها

```bash
jobs
```

```
[1]+  Running                 sleep 300 &
[2]-  Stopped                 vim notes.txt
```

- `+` آخرین job دستکاریشده را علامت میزند — هدف پیشفرض برای `fg` و `bg`.
- `-` دومی از آخر را علامت میزند.
- وضعیتها: `Running`، `Stopped`، `Done`، `Terminated`.

`jobs -l` PIDها را هم اضافه میکند. `jobs -r` فقط jobهای در حال اجرا و `jobs -s` فقط jobهای متوقفشده را نشان میدهد.

`jobs` تنها jobهای متعلق به شل فعلی را فهرست میکند. ترمینالهای دیگر و نشستهای SSH دیگر هرکدام فهرست خودشان را نگه میدارند.

## ۱.۳ Ctrl-Z، `bg`، `fg` — معلق کردن و ادامه دادن

گردش کاریای که ارزش دارد در حافظه سپرده شود:

```bash
$ vim notes.txt
# press Ctrl-Z
[1]+  Stopped                 vim notes.txt

$ bg
[1]+ vim notes.txt &

$ fg
```

- **Ctrl-Z** سیگنال `SIGTSTP` را میفرستد و فرایند را معلق میکند. فرایند منجمد میشود، نه خاتمهیافته؛ حافظه و توصیفگرهای فایل حفظ میشوند.
- **`bg`** سیگنال `SIGCONT` را میفرستد و job را در پسزمینه ادامه میدهد. job پسزمینهای که تلاش کند از ترمینال بخواند، `SIGTTIN` دریافت کرده و دوباره متوقف میشود.
- **`fg`** یک job را به پیشزمینه میآورد. `fg %2` یک job مشخص را هدف میگیرد.

یک job متوقفشده همچنان منابعش را نگه میدارد — اتصالات دیتابیس، فایلهای قفل، حافظه. یک `rsync` متوقفشده به پایان نرسیده است؛ فقط متوقف شده. اگر `jobs` چیزی را که انتظار دارید نشان نمیدهد، `ps aux | grep <name>` را بررسی کنید، چون ممکن است فرایند به شل دیگری تعلق داشته باشد.

## ۱.۴ `disown` — جدا کردن از جدول jobها

برای فرایندی که قبلاً با `&` اجرا شده و باید بیشتر از شل زنده بماند:

```bash
long_task.sh &
disown %1
```

حذف آن از جدول jobها یعنی سیگنال `SIGHUP` هنگام خروج شل را دریافت نخواهد کرد. `disown -h %1` آن را طوری علامت میزند که `SIGHUP` را نادیده بگیرد، در حالی که همچنان در `jobs` دیده میشود.

این یک اصلاح پسرو است. وقتی قصد از ابتدا معلوم است، `nohup` آن را مستقیماً بیان میکند.

## ۱.۵ `nohup` — جان سالم به در بردن از hangup

```bash
nohup ./long-task.sh > out.log 2>&1 &
```

چه کاری انجام میدهد:

1. فرایند را طوری تنظیم میکند که `SIGHUP` را نادیده بگیرد.
2. اگر stdout یک ترمینال باشد، آن را به `nohup.out` تغییر مسیر میدهد — و به همین دلیل تغییر مسیر صریح بالا لازم است، چون در غیر این صورت `nohup.out` بیدرمان رشد میکند.
3. کار دیگری انجام نمیدهد. `&` انتهایی همچنان برای بازگشت به prompt لازم است.

چه کاری انجام نمیدهد:

- فرایند را به شکلی از نشست جدا نمیکند که در برابر تغییر ترمینال دوام بیاورد.
- اگر کرش کند، دوباره راهاندازیاش نمیکند.
- پس از ریبوت آن را اجرا نمیکند.
- لاگ، تلاش مجدد یا هیچگونه دیدی نسبت به شکستها فراهم نمیکند.

`nohup` دقیقاً یک مسئله را حل میکند — همان hangup. برای یک دستور یکباره که هیچکس نیازی به پایش اتمامش ندارد مناسب است. هر چیز طولانیمدت به بخش ۲ تعلق دارد.

## ۱.۶ خلاصهی بخش ۱

| نیاز | دستور |
|---|---|
| اجرا در پسزمینه، با ترمینال باز | `cmd &` |
| فهرست jobهای پسزمینه | `jobs -l` |
| آوردن job به پیشزمینه | `fg %1` |
| ادامه دادن job متوقفشده در پسزمینه | `bg %1` |
| معلق کردن job پیشزمینه | `Ctrl-Z` |
| زنده ماندن job پس از خروج شل | `nohup cmd &` یا `disown %1` |
| طولانیمدت، با نظارت و لاگ | unit در systemd (بخش ۲) |

---

# بخش ۲ — systemd: مدیریت سرویسها

## ۲.۱ systemd چیست

systemd همان init system و service manager برای بیشتر توزیعهای مدرن است (اوبونتو، دبیان، فدورا، RHEL، آرچ). در بوت به عنوان PID 1 شروع میشود و مسئول موارد زیر است:

- راهاندازی و توقف **سرویسها** (دیمنها).
- مدیریت **زمانبندیها** (timerها، جایگزین مدرن cron).
- مدیریت **سوکتها** (راهاندازی سرویس هنگام اولین اتصال).
- جمعآوری **لاگها** (journald).
- اعمال **sandboxing** روی سرویسها.

`systemctl` رابط کنترل است؛ `journalctl` لاگهای آن را میخواند.

هر اپلیکیشن Laravel، Django، Node و Rails که در دههی گذشته مستقر شده، queue workerها و schedulerهایش را به صورت unitهای systemd اجرا کرده است. دلیلش عملی است: از قبل روی میزبان نصب است، به طور پیشفرض لاگها را میگیرد و فرایندهایی را که میمیرند دوباره راهاندازی میکند.

## ۲.۲ Unitها

هر چیزی که systemd مدیریت میکند یک **unit** است. انواعی که در عمل اهمیت دارند:

| نوع | پسوند | کاربرد |
|---|---|---|
| **Service** | `.service` | یک دیمن یا فرایند |
| **Timer** | `.timer` | یک محرک زمانبندیشده |
| **Target** | `.target` | گروهی از unitها |
| **Socket** | `.socket` | سرویس را هنگام اتصال راهاندازی میکند |
| **Path** | `.path` | سرویس را هنگام تغییر فایل راهاندازی میکند |

### محل قرارگیری فایلهای unit

| مسیر | هدف |
|---|---|
| `/usr/lib/systemd/system/` | unitهای ارائهشده توسط بستهها — هرگز اینها را ویرایش نکنید |
| `/etc/systemd/system/` | unitها و overrideهای محلی، با اولویت بالاتر |
| `~/.config/systemd/user/` | unitهای کاربر، اجرا با `systemctl --user` |

فایلهای ارائهشده در `/usr/lib` هنگام بهروزرسانی بازنویسی میشوند. unitهای سفارشی و drop-inها به `/etc` تعلق دارند.

## ۲.۳ دستورهای روزمره

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

خواندن `Loaded:`:

- `enabled` — در بوت شروع میشود.
- `disabled` — در بوت شروع نمیشود، اما میتوان دستی راهاندازیاش کرد.
- `masked` — اصلاً نمیتواند شروع شود، حتی دستی.
- `static` — بخش `[Install]` ندارد؛ توسط unit دیگری راهاندازی میشود.
- `failed` — آخرین اجرا شکست خورده؛ با `journalctl -u` بررسی کنید.

خواندن `Active:`:

- `active (running)` — در حال اجرا.
- `active (exited)` — `ExecStart` یکبار اجرا و با موفقیت خارج شده. برای `Type=oneshot` طبیعی است.
- `inactive (dead)` — در حال اجرا نیست.
- `failed` — با کد غیرصفر خارج شده یا کرش کرده.

### مجموعه دستورها

```bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl reload-or-restart nginx
```

`reload` در برابر `restart`: `reload` سیگنال `SIGHUP` را میفرستد (یا `ExecReload` را اجرا میکند) تا سرویس پیکربندی را دوباره بخواند و در عین حال اتصالات موجود را باز نگه دارد. `restart` هر درخواست در جریان را خاتمه میدهد. برای nginx و php-fpm، `reload` انتخاب درست در هنگام استقرار است.

```bash
sudo systemctl enable nginx
sudo systemctl disable nginx
sudo systemctl enable --now nginx
sudo systemctl disable --now nginx
```

`--now` عمل enable/disable را با start/stop ترکیب میکند.

### `mask` در برابر `disable`

`disable` پیوند بوت را حذف میکند اما unit همچنان به صورت دستی یا به عنوان وابستگی قابل راهاندازی است. `mask` unit را به `/dev/null` پیوند میدهد و آن را تا زمانی که unmask نشود از هر راهی غیرقابل راهاندازی میکند.

```bash
sudo systemctl mask bluetooth.service
sudo systemctl unmask bluetooth.service
```

از `mask` استفاده کنید وقتی که یک سرویس باید تحت هر شرایطی از شروع شدن منع شود.

## ۲.۴ نوشتن یک unit سرویس

یک queue worker، به عنوان مثال عینی. `/etc/systemd/system/laravel-queue.service`:

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

### `[Unit]` — فراداده و ترتیب

- **`Description=`** — در `systemctl status` و `journalctl` نمایش داده میشود.
- **`After=`** — فقط ترتیب. اگر MySQL شکست بخورد، این unit باز هم شروع میشود.
- **`Wants=`** — وابستگی نرم؛ آن unit را هم شروع کن، شکستش را نادیده بگیر.
- **`Requires=`** — وابستگی سخت؛ اگر آن یکی شکست بخورد، این unit هم شکست میخورد.

`After=` ترتیب را کنترل میکند. `Wants=` و `Requires=` وابستگی را. اینها مستقلاند: `After=mysql.service` همراه با `Requires=mysql.service` یعنی «منتظر MySQL بمان و اگر نتوانست شروع شود، شکست بخور.»

### `[Service]` — چگونگی اجرا

- **`Type=simple`** — پیشفرض. `ExecStart` در پیشزمینه اجرا میشود و systemd تا خروج آن را ردیابی میکند. برای `queue:work`، Node و Octane درست است.
- **`Type=oneshot`** — دستور یکبار اجرا و خارج میشود. برای schedulerها و کارهای راهاندازی استفاده میشود. `RemainAfterExit=yes` unit را پس از اتمام در وضعیت `active (exited)` نگه میدارد.
- **`Type=forking`** — فرایند fork میکند و والد خارج میشود؛ systemd فرزند را ردیابی میکند. برای nginx و php-fpm رایج است.
- **`User=` / `Group=`** — حسابی که با آن اجرا میشود. حسابهای سرویس باید فقط مجوزهایی را داشته باشند که سرویس نیاز دارد.
- **`WorkingDirectory=`** — دایرکتوری کاری برای `ExecStart`. برای Laravel باید ریشهی اپلیکیشن باشد.
- **`ExecStart=`** — دستور. systemd شلی فراخوانی نمیکند، بنابراین `~`، `$VAR`، pipeها و تغییر مسیرها تفسیر نمیشوند. از مسیرهای مطلق استفاده کنید؛ وقتی واقعاً به امکانات شل نیاز دارید آن را در `bash -c '...'` بپیچید.
- **`Restart=`** — `always` در هر خروجی دوباره راهاندازی میکند؛ `on-failure` فقط با خروج غیرصفر؛ `no` پیشفرض است. queue workerها از `always` استفاده میکنند؛ schedulerهای oneshot از `no`.
- **`RestartSec=`** — تأخیر پیش از راهاندازی مجدد، که از مصرف CPU توسط یک حلقهی کرش جلوگیری میکند.

### `[Install]` — رفتار بوت

- **`WantedBy=multi-user.target`** — این unit را هنگام رسیدن سیستم به حالت multi-user وارد میکند. همین چیزی است که `enable` روی آن عمل میکند. بدون بخش `[Install]`، unit وضعیت `static` دارد و باید توسط unit دیگری راهاندازی شود.

### راهاندازی آن

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now laravel-queue.service
sudo systemctl status laravel-queue.service
sudo journalctl -u laravel-queue.service -f
```

`daemon-reload` پس از هر ویرایش در فایل unit الزامی است. systemd تعریفهای unit را کش میکند؛ بدون reload، فایل ویرایششده نادیده گرفته میشود و نسخهی قبلی همچنان استفاده میشود. این رایجترین دلیل به نظر رسیدن بیاثر بودن یک ویرایش است.

## ۲.۵ لاگها با `journalctl`

فایلهای unit خروجی را تغییر مسیر نمیدهند. systemd خروجی stdout و stderr را میگیرد و `journalctl` آنها را میخواند.

```bash
journalctl -u laravel-queue.service
journalctl -u laravel-queue.service -f
journalctl -u laravel-queue.service --since "1 hour ago"
journalctl -u laravel-queue.service -n 100
journalctl -u laravel-queue.service -p err
journalctl --user -u mytask.service
journalctl --since today -u nginx -u php8.2-fpm
```

نگهداری لاگها در journald توسط `/etc/systemd/journald.conf` کنترل میشود. محدودیتهای پیشفرض ممکن است کم باشند؛ روی یک میزبان تولیدی، `SystemMaxUse=` را افزایش دهید و `Storage=persistent` را تنظیم کنید تا لاگها از ریبوت جان سالم به در ببرند. برای انطباق یا تحلیل بلندمدت، لاگها را به یک مقصد اختصاصی ارسال کنید و به journald تنها تکیه نکنید.

Laravel علاوه بر این در `storage/logs/laravel.log` مینویسد. `journalctl` آنچه worker در stdout و stderr چاپ کرده را نشان میدهد؛ هر دو محل ارزش بررسی دارند.

## ۲.۶ Timerها

Timerها جایگزین cron هستند و این موارد را ارائه میدهند:

- **جبران اجراهای ازدسترفته** با `Persistent=true`.
- **وابستگیها** — یک کار میتواند به دیتابیس نیاز داشته باشد.
- **لاگگیری** از طریق `journalctl -u`.
- **محیط صریح** — کاربر و دایرکتوری کاری اعلام میشوند، نه ارثبری.

scheduler لاراول نمونهی کلاسیک است.

### گام ۱ — سرویس

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

`Type=oneshot` با این رفتار همخوان است: `schedule:run` کارهای سررسیده را ارسال میکند و خارج میشود.

### گام ۲ — timer

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

- **`OnCalendar=*:*:00`** — هر دقیقه در ثانیهی صفر. هر عبارت تقویمی را با `systemd-analyze calendar "*:*:00"` بررسی کنید.
- **`Persistent=true`** — اگر میزبان در هنگام یک تیک زمانبندیشده خاموش بوده، یکبار در بوت بعدی اجرا شود. این مزیت اصلی نسبت به cron است.
- **`WantedBy=timers.target`** — چیزی که `enable` روی آن عمل میکند.

محرکهای رایج دیگر:

```ini
OnBootSec=5min
OnUnitActiveSec=15min
OnCalendar=Mon..Fri 09:00
OnCalendar=*-*-* 02:00:00
```

### گام ۳ — فعال کردن timer

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now laravel-schedule.timer

systemctl list-timers --all
journalctl -u laravel-schedule.service -n 20
```

فعال کردن `.service` به جای `.timer` باعث میشود یکبار در بوت اجرا شود و دیگر هرگز — timer همان جزء زمانبندی است. وقتی یک timer از اجرا بازمیماند، `systemctl list-timers` اجرای زمانبندیشدهی بعدی را نشان میدهد و `journalctl -u <name>.service` نشان میدهد که آیا خود سرویس اجرا شده است یا نه.

## ۲.۷ گروهبندی سرویسها با targetها

وقتی چند unit یک اپلیکیشن را میسازند، یک **target** سفارشی آنها را به صورت یک واحد مدیریت میکند.

`/etc/systemd/system/laravel-app.target`:

```ini
[Unit]
Description=Laravel Application Stack
After=network.target

Wants=laravel-queue.service
Wants=laravel-schedule.timer
Wants=laravel-octane.service
```

هر unit عضو هم در بخش `[Unit]` خود به این نیاز دارد:

```ini
PartOf=laravel-app.target
```

`Wants=` باعث میشود target اعضایش را راهاندازی کند. `PartOf=` باعث میشود توقف یا راهاندازی مجدد target به آنها سرایت کند. هر دو برای مدیریت کامل چرخهی عمر لازماند.

```bash
sudo systemctl daemon-reload
sudo systemctl enable laravel-app.target
sudo systemctl start laravel-app.target
sudo systemctl status laravel-app.target
```

حالا `start`، `stop`، `restart`، `enable` و `disable` در کل پشته آبشاری عمل میکنند.

### جایگزین موردی

برای یک عملیات یکباره، نام unitها را میتوان فهرست کرد یا با wildcard به کار برد:

```bash
sudo systemctl restart laravel-queue.service laravel-octane.service
sudo systemctl restart 'laravel-queue@*'
```

برای هر چیزی که مکرراً یا در بوت استفاده میشود، target ترجیح دارد؛ شکل فهرستی برای یک دستور واحد خوب است.

## ۲.۸ Templateها

چند worker با شکل یکسان نیازی به فایلهای unit تکراری ندارند. یک template از `@` در نام فایل استفاده میکند:

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

`%i` با نام نمونه جایگزین میشود:

```bash
sudo systemctl enable --now laravel-queue@default
sudo systemctl enable --now laravel-queue@emails
sudo systemctl enable --now laravel-queue@webhooks
```

هر worker صف متفاوتی را مدیریت میکند و `systemctl restart 'laravel-queue@*'` همه را با هم راهاندازی مجدد میکند.

## ۲.۹ overrideهای drop-in

برای تغییر یک unit ارائهشده توسط بسته، به جای ویرایش فایل زیر `/usr/lib` یک drop-in بسازید:

```bash
sudo systemctl edit nginx
```

این `/etc/systemd/system/nginx.service.d/override.conf` را باز میکند. فقط دستورهایی که تغییر کردهاند لازم است:

```ini
[Service]
RestartSec=15
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart nginx
```

drop-inها روی unit پایه ادغام میشوند، از بهروزرسانی بستهها جان سالم به در میبرند و به صورت جداگانه قابل حسابرسی باقی میمانند. `systemctl cat nginx` unit پایه و پس از آن همهی drop-inها را چاپ میکند و پیکربندی مؤثر را نشان میدهد.

## ۲.۱۰ unitهای کاربر

بدون root، سرویسها میتوانند در نشست کاربر اجرا شوند:

```bash
mkdir -p ~/.config/systemd/user
# write mytask.service there
systemctl --user daemon-reload
systemctl --user enable --now mytask.service
systemctl --user status mytask.service
journalctl --user -u mytask.service
```

unitهای کاربر معمولاً هنگام خروج متوقف میشوند. برای زنده نگه داشتن آنها:

```bash
sudo loginctl enable-linger $USER
```

با فعال بودن lingering، سرویسهای کاربر در بوت شروع میشوند و پس از خروج دوام میآورند — برای اپلیکیشنهای شخصی روی یک VPS مفید است.

## ۲.۱۱ hardening

systemd میتواند محدود کند که یک سرویس به چه چیزهایی دسترسی دارد. آنگاه یک queue worker بهخطرافتاده دسترسی محدودی به میزبان دارد.

افزودنیها به `[Service]`:

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

نتیجه را امتیازدهی کنید:

```bash
systemd-analyze security laravel-queue.service
```

امتیازها از ۱ (بدون محدودیت) تا ۱۰ (بهشدت محصور) هستند. یک worker لاراول معمولاً با دستورهای بالا به ۵ تا ۷ میرسد.

`ProtectHome=true` همهی دسترسی به `/home` را مسدود میکند. اگر اپلیکیشن زیر `/home/deploy/app` مستقر شده، از `ProtectHome=read-only` استفاده کنید یا مسیرها را به `ReadWritePaths=` اضافه کنید. دستورها را به تدریج اضافه کنید و پس از هر کدام سرویس را راهاندازی مجدد کنید، چون محدودسازی بیش از حد به صورت خطاهای مجوز داخل اپلیکیشن ظاهر میشود.

## ۲.۱۲ عیبیابی

به ترتیب:

1. **`systemctl status <unit>`** — بخشهای `Loaded:`، `Active:` و خطوط لاگ انتهایی به بیشتر پرسشها پاسخ میدهند.
2. **`journalctl -u <unit> -n 50 --no-pager`** — لاگ کامل اخیر.
3. **`systemctl cat <unit>`** — فایل unit مؤثر، شامل drop-inها.
4. **`systemd-analyze verify /etc/systemd/system/<unit>.service`** — خطاهای تجزیه و دستورهای ناشناخته.
5. **`systemctl reset-failed <unit>`** — پاک کردن یک وضعیت failed کهنه.
6. **`systemctl --failed`** — همهی چیزهایی که در حال حاضر خراب هستند.

علل رایج:

- **"Command not found"** — `ExecStart` از یک مسیر نسبی استفاده میکند، یا یک باینری خارج از `PATH` سیستمd است.
- **"Permission denied"** — کاربر `User=` نمیتواند `WorkingDirectory=` را بخواند یا در `storage/` بنویسد.
- **"Timed out"** — راهاندازی از `TimeoutStartSec=` فراتر رفته.
- **ویرایش بیاثر است** — `daemon-reload` اجرا نشده.
- **دستی کار میکند، در بوت شکست میخورد** — ترتیبدهی نسبت به unitی که هنوز وجود ندارد. وقتی به اتصال شبکهی واقعی نیاز است، از `network-online.target` به جای `network.target` استفاده کنید.

---

# بخش ۳ — یک پشتهی کامل Laravel

## فایلها

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

## راهاندازی پشته

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now laravel-app.target
sudo systemctl status laravel-app.target
systemctl list-timers laravel-schedule.timer
journalctl -u laravel-queue@default -f
```

## ترتیب استقرار

```bash
cd /var/www/myapp && git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
sudo systemctl restart laravel-queue@default laravel-queue@emails laravel-octane
sudo systemctl reload php8.3-fpm
```

workerها و Octane راهاندازی مجدد میشوند؛ scheduler نیازی به این کار ندارد. یک فرایند `queue:work` کلاسهای PHP را که هنگام شروعش بارگذاری کرده نگه میدارد، بنابراین workerی که پیش از استقرار شروع شده، همچنان کد قدیمی را اجرا میکند. scheduler به صورت `oneshot` اجرا میشود و در هر فراخوانی کد تازه بارگذاری میکند. وقتی یک اصلاح در `php artisan tinker` کار میکند اما از طریق صف نه، اولین چیزی که باید بررسی شود یک worker کهنه است.

---

# برگهی تقلب

## کنترل job

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

## سه علت تکرارشوندهی سردرگمی

1. **یک ویرایش unit بیاثر است** — `daemon-reload` اجرا نشده.
2. **یک timer یکبار اجرا میشود و دیگر هرگز** — `.service` فعال شده، نه `.timer`.
3. **`ExecStart` برخلاف همان دستور در شل رفتار میکند** — هیچ شلی در کار نیست. از مسیرهای مطلق استفاده کنید؛ وقتی امکانات شل لازم است آن را در `bash -c` بپیچید.

---

# تمرینها

اینها را روی یک VM یکبارمصرف (Multipass، Docker یا یک VPS ارزان) اجرا کنید.

1. **کنترل job.** `sleep 1000 &` را اجرا کنید. شمارهی job و PID را یادداشت کنید. معلقش کنید، در پسزمینه ادامهاش دهید، سپس آن را با PID بکشید نه با شمارهی job. با `jobs` و `ps` تأیید کنید.

2. **رفتار `nohup`.** در یک نشست SSH، `nohup sleep 1000 &` را اجرا کنید و قطع اتصال دهید. دوباره وصل شوید و ببینید آیا زنده مانده. سپس `sleep 1000 &` بدون محافظ را امتحان کنید و نتیجه را مقایسه کنید.

3. **اولین سرویس.** unitی بنویسید که `bash -c 'while true; do date >> /tmp/hb.log; sleep 5; done'` را با کاربر `nobody` اجرا کند. آن را enable کنید، با `journalctl -u` دنبالش کنید، سپس متوقف و disable کنید.

4. **Timer.** یک `.timer` بنویسید که هر ۳۰ ثانیه `date` را به `/tmp/cron-test.log` اضافه کند. با `list-timers` و `journalctl` بررسی کنید. پس از گذشتن زمان یک تیک زمانبندیشده، VM را ریبوت کنید و ببینید آیا `Persistent=true` اجرای ازدسترفته را جبران کرده است.

5. **Target.** سه فایل `.service` کوچک بسازید، آنها را زیر یک `.target` گروه کنید، به هر کدام `PartOf=` اضافه کنید و تأیید کنید که `systemctl stop <target>` هر سه را متوقف میکند.

6. **شکست عمدی.** در `ExecStart` یک غلط تایپی وارد کنید (مثلاً `artisan queue:work` بدون مسیر کامل). تلاش کنید آن را شروع کنید، خطا را بخوانید، سپس اصلاحش کنید. توجه کنید `systemctl status` کجا را نشان داد.

7. **Hardening.** سرویس heartbeat از تمرین ۳ را بردارید، `ProtectHome=true` و `ProtectSystem=strict` را اضافه کنید و با `systemd-analyze security` دوباره امتیازدهی کنید.

---

# سخن پایانی

تفاوت میان اسکریپتی که روی یک لپتاپ کار میکند و سرویسی که در محیط تولید دوام میآورد به پنج ویژگی خلاصه میشود: **نظارت** (راهاندازی مجدد هنگام کرش)، **قابل مشاهده بودن** (journald)، **زمانبندی** (timerها)، **گروهبندی** (targetها) و **جداسازی** (hardening).

`nohup` ابزاری تکمنظوره برای دستورهای یکبارهای است که هیچکس نیازی به پایششان ندارد. بهمحض اینکه یک فرایند باید به کار ادامه دهد، هنگام شکست دوباره راهاندازی شود، لاگ تولید کند یا در کنار دیگران مدیریت شود، به یک unit در systemd تعلق دارد. قالب فایل unit ارزش یکبار یادگیری را دارد: همان لایهی عملیاتی هر سیستم لینوکسی است که با آن کار خواهید کرد.

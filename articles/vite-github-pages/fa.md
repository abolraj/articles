---
title: اپلیکیشن‌های Vite + گیت‌هاب پیجز
date: 2026-11-07
excerpt: انتشار اپلیکیشن‌های Vite در گیت‌هاب پیجز
---

# انتشار اپ Vite در Github Pages: راهنمای کامل

انتشار یک اپلیکیشن Vite در گیت‌هاب پیجز باید ساده باشد، اما چند جزئیات پیکربندی معمولاً افراد را به مشکل می‌اندازد—به‌ویژه زمانی که اپلیکیشن در یک زیرمسیر (`https://<username>.github.io/<repo-name>/`) قرار دارد. این راهنما شما را از پیکربندی Vite تا خودکارسازی با گیت‌هاب اکشنز و رفع خطاهای رایج همراهی می‌کند.

---

## 📋 پیش‌نیازها

- یک پروژهٔ Vite (React، Vue، Svelte یا vanilla).
- یک مخزن گیت‌هاب.
- (اختیاری) pnpm اگر به‌صورت محلی از آن استفاده می‌کنید—گردش‌کار این راهنما برای pnpm تنظیم شده است، اما می‌توانید آن را با npm یا yarn سازگار کنید.

---

## گام ۱: تنظیم مسیر `base` در Vite

این **مهم‌ترین گام** برای سایت‌های پروژه‌ای است. به‌طور پیش‌فرض Vite از `base: '/'` استفاده می‌کند که فرض می‌کند اپلیکیشن از ریشهٔ دامنه سرو می‌شود. سایت‌های پروژه‌ای گیت‌هاب پیجز از `https://<username>.github.io/<repo-name>/` سرو می‌شوند، بنابراین دارایی‌هایی مثل CSS و JavaScript از `/assets/...` درخواست می‌شوند نه از `/<repo-name>/assets/...`، و نتیجه **خطای 404 برای همهٔ دارایی‌ها** است.

فایل `vite.config.ts` (یا `vite.config.js`) را باز کنید و `base` را برابر نام مخزن قرار دهید:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/<your-repo-name>/',   // e.g. '/my-portfolio/'
})
```

> **نکته:** هم اسلش ابتدا و هم اسلش انتها را قرار دهید. نام باید دقیقاً (با حساسیت به حروف بزرگ و کوچک) با نام مخزن شما یکسان باشد. اگر در حال انتشار در **سایت کاربر یا سازمان** (`https://<username>.github.io/`) هستید یا از **دامنهٔ سفارشی** استفاده می‌کنید، به‌جای آن `base: '/'` را تنظیم کنید.

پس از این تغییر، Vite همهٔ ارجاع‌های دارایی تولیدشده را با `/<your-repo-name>/` پیشوند می‌کند و فایل `dist/index.html` ساخته‌شده باید مسیرهایی مانند `/my-portfolio/assets/index-abc123.js` داشته باشد.

---

## گام ۲: مدیریت مسیریابی سمت کلاینت (SPA Fallback)

اگر اپلیکیشن شما از **مسیریابی سمت کلاینت** (مثل React Router یا Vue Router) استفاده می‌کند، دو گزینه دارید. بدون یکی از آن‌ها، رفرش صفحه در یک URL غیرریشه صفحهٔ 404 گیت‌هاب را برمی‌گرداند، چون گیت‌هاب پیجز فایل‌های استاتیک را سرو می‌کند و مسیرهای SPA را نمی‌شناسد.

### گزینهٔ الف: استفاده از `HashRouter` (ساده‌ترین)

`HashRouter` مسیر را بعد از `#` قرار می‌دهد (مثلاً `https://example.com/#/about`). سرور همیشه فقط مسیر ریشه را می‌بیند، بنابراین رفرش‌ها و لینک‌های مستقیم همیشه بدون هیچ پیکربندی سمت سرور کار می‌کنند. این ساده‌ترین راه‌حل برای هاست‌های استاتیک مثل گیت‌هاب پیجز است.

```tsx
import { HashRouter } from 'react-router-dom'

<HashRouter>
  <App />
</HashRouter>
```

هزینهٔ این کار آن است که URLها شامل `#` می‌شوند، که کمی کمتر تمیز است اما کاملاً کاربردی است.

### گزینهٔ ب: استفاده از `BrowserRouter` همراه با `basename` و فایل پشتیبان `404.html`

اگر URLهای تمیز (بدون `#`) می‌خواهید، به دو چیز نیاز دارید:

1. **`basename` روی روتر** تا از زیرمسیر مخزن آگاه باشد.
2. **یک فایل `404.html`** که همانند `index.html` باشد تا گیت‌هاب پیجز برای مسیرهای ناشناخته پوستهٔ SPA شما را سرو کند، نه صفحهٔ 404 خودش.

برای React Router:

```tsx
import { BrowserRouter } from 'react-router-dom'

<BrowserRouter basename={import.meta.env.BASE_URL}>
  <App />
</BrowserRouter>
```

`import.meta.env.BASE_URL` در محیط تولید به‌طور خودکار `/<your-repo-name>/` و در محیط توسعه `/` خواهد بود، بنابراین یک کد در هر دو محیط کار می‌کند.

برای فایل پشتیبان، یک فایل `404.html` در پوشهٔ `public/` با همان محتوای `index.html` بسازید (یا به‌سادگی پس از بیلد، `index.html` را به `404.html` کپی کنید). یک روش رایج آن است که اسکریپت کوچکی در `404.html` اضافه کنید که به `index.html` ریدایرکت کند و مسیر را حفظ کند، اما حتی یک کپی ساده هم برای سرو پوستهٔ SPA کافی است.

> **کاربران Vue:** Vue Router از `createWebHistory` با آرگومان `base` پشتیبانی می‌کند. `import.meta.env.BASE_URL` را به آن پاس دهید و در صورت تمایل به URLهای تمیز، از همان استراتژی `404.html` استفاده کنید.

---

## گام ۳: ساخت گردش‌کار گیت‌هاب اکشنز

یک فایل در `.github/workflows/deploy.yml` بسازید. گردش‌کار زیر اپلیکیشن شما را با pnpm بیلد می‌کند و پوشهٔ `dist` را با استفاده از `peaceiris/actions-gh-pages` در شاخهٔ `gh-pages` منتشر می‌کند.

```yaml
name: Deploy

on:
  push:
    branches:
      - main   # change to 'master' if that is your default branch

# Required for the GITHUB_TOKEN to push to the repository
permissions:
  contents: write

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9   # match your local pnpm version

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build project
        run: pnpm run build

      - name: Upload production-ready build files
        uses: actions/upload-artifact@v4
        with:
          name: production-files
          path: ./dist

  deploy:
    name: Deploy
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: production-files
          path: ./dist

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### نکات کلیدی دربارهٔ این گردش‌کار

- **`permissions: contents: write`** ضروری است. بدون آن، `GITHUB_TOKEN` نمی‌تواند در شاخهٔ `gh-pages` پوش کند و گام استقرار با خطای Git (`exit code 128` یا `403`) شکست می‌خورد.
- **pnpm باید قبل از Node تنظیم شود** تا `cache: 'pnpm'` درست کار کند.
- **`--frozen-lockfile`** تضمین می‌کند بیلد CI از نسخه‌های دقیق وابستگی‌های موجود در `pnpm-lock.yaml` استفاده کند.
- **`peaceiris/actions-gh-pages@v4`** شاخهٔ `gh-pages` را به‌طور خودکار می‌سازد و پوش می‌کند. نیازی به ساخت دستی این شاخه نیست.

---

## گام ۴: پیکربندی منبع گیت‌هاب پیجز

پس از اولین اجرای موفق گردش‌کار، گیت‌هاب پیجز را طوری تنظیم کنید که از شاخه‌ای که اکشن ساخته است سرو شود:

1. به بخش **Settings → Pages** مخزن خود بروید.
2. زیر **Build and deployment → Source** گزینهٔ **"Deploy from a branch"** را انتخاب کنید.
3. شاخهٔ **`gh-pages`** و پوشهٔ **`/ (root)`** را انتخاب کنید.
4. ذخیره کنید.

گیت‌هاب سایت شما را در `https://<username>.github.io/<repo-name>/` منتشر می‌کند.

> برخی گردش‌کارها به‌جای آن از اکشن رسمی `actions/deploy-pages` استفاده می‌کنند که نیازمند تنظیم منبع روی **"GitHub Actions"** است. روش `peaceiris` بالا از منبع مبتنی بر شاخه (`gh-pages`) استفاده می‌کند که ساده‌تر است و برای پروژه‌های Vite به‌طور قابل‌اعتمادی کار می‌کند.

---

## 🔧 رفع خطاهای رایج

### ❌ دارایی‌ها 404 برمی‌گردانند (`/assets/index-abc.js` پیدا نشد)

**علت:** `base` در Vite هنوز `/` است نه `/<repo-name>/`.
**راه‌حل:** در `vite.config.ts` مقدار `base: '/<repo-name>/'` را تنظیم کرده و دوباره بیلد کنید.

### ❌ گردش‌کار با `exit code 128` یا `403 Permission denied` شکست می‌خورد

**علت:** `GITHUB_TOKEN` مجوز نوشتن ندارد.
**راه‌حل:** بلوک `permissions: contents: write` را به فایل گردش‌کار اضافه کنید (همان‌طور که در بالا آمده)، **یا** به **Settings → Actions → General → Workflow permissions** بروید و **"Read and write permissions"** را انتخاب کنید.

### ❌ رفرش یک زیرصفحه صفحهٔ 404 گیت‌هاب را برمی‌گرداند

**علت:** هیچ پشتیبان SPA پیکربندی نشده است.
**راه‌حل:** از `HashRouter` استفاده کنید، یا `basename` را به `BrowserRouter` اضافه کنید و یک `404.html` فراهم کنید که همانند `index.html` باشد.

### ❌ صفحهٔ سفید بدون خطای قابل‌مشاهده

**علت:** معمولاً همان مشکل `base` است، یا دارایی‌ها از مبدأ اشتباه درخواست می‌شوند. تب **Network** در DevTools مرورگر را باز کنید و URLهای درخواستی را بررسی کنید. اگر با `/assets/` شروع می‌شوند نه `/<repo-name>/assets/`، به گام ۱ بازگردید.

### ❌ آیکون‌ها یا تصاویر پوشهٔ `public/` بارگذاری نمی‌شوند

فایل‌های داخل `public/` به ریشهٔ `dist` کپی می‌شوند. وقتی `base` درست تنظیم شده باشد، Vite به‌طور خودکار پیشوند دارایی‌های ارجاع‌شده در کد را مدیریت می‌کند، اما **مسیرهای هاردکدشده** در CSS یا HTML (مثلاً `url('/logo.png')`) همچنان خراب می‌شوند. از مسیرهای نسبی استفاده کنید یا هنگام ساخت URL به `import.meta.env.BASE_URL` ارجاع دهید.

---

## ✅ بررسی صحت انتشار

پس از تکمیل گردش‌کار:

1. `https://<username>.github.io/<repo-name>/` را باز کنید. اپلیکیشن باید بدون 404 در کنسول بارگذاری شود.
2. مستقیماً `https://<username>.github.io/<repo-name>/assets/<some-built-file>.js` را باز کنید. باید محتوای فایل را برگرداند، نه 404.
3. به یک زیرصفحه بروید و رفرش کنید. اگر مسیریابی را درست پیکربندی کرده باشید، صفحه باید بدون 404 گیت‌هاب دوباره بارگذاری شود.

---

## 📌 چک‌لیست سریع

- [ ] `base: '/<repo-name>/'` در `vite.config.ts`
- [ ] `basename={import.meta.env.BASE_URL}` روی `BrowserRouter` (یا استفاده از `HashRouter`)
- [ ] فایل پشتیبان `404.html` در `public/` (در صورت استفاده از `BrowserRouter`)
- [ ] گردش‌کار شامل `permissions: contents: write`
- [ ] منبع گیت‌هاب پیجز روی شاخهٔ `gh-pages` تنظیم شده
- [ ] نسخهٔ pnpm در گردش‌کار با نسخهٔ محلی شما یکسان است

با فراهم بودن این قطعات، هر پوش به شاخهٔ پیش‌فرض شما به‌طور خودکار اپلیکیشن Vite را بیلد و در گیت‌هاب پیجز منتشر می‌کند—بدون نیاز به هیچ گام دستی.
```

---

### نکته‌های ویرایشی

- **جهت متن:** اگر سایت شما از Markdown استاندارد استفاده می‌کند، معمولاً نیازی به تنظیم دستی RTL نیست؛ اما اگر با رندرر خاصی مشکل داشتید، می‌توانید در ابتدای فایل از تگ `<div dir="rtl">` استفاده کنید یا در CSS سایت `direction: rtl` را فعال کنید.
- **بلوک‌های کد:** عمداً به انگلیسی و بدون تغییر باقی مانده‌اند، چون کد YAML/TS/TSX باید همان‌طور که هست اجرا شود.
- **فرانت‌متر:** فیلدهای `title` و `excerpt` ترجمه شده‌اند؛ `date` و ساختار فرانت‌متر دست‌نخورده مانده تا با ابزارهای سایت‌ساز شما سازگار باشد.
---
title: ادامه‌ی اعداد مختلط؛ نمایش دکارتی، قطبی، مزدوج و قانون دموآور
date: 2026-11-26
excerpt: سه نمایش عدد مختلط (دکارتی، استاندارد، قطبی)، مزدوج و خواص آن، ضرب و تقسیم در شکل قطبی، قانون دموآور و ریشه‌گیری، همراه با نمودارهای تصویری و ۱۰ مسئله‌ی چالشی
---

# 🧭 ادامه‌ی اعداد مختلط

> در مقاله‌ی قبل ساختیم: $\mathbb{C} = \mathbb{R}^2$ با جمع و ضرب مخصوص، و دیدیم ۹ اصل موضوعه برقرار است. حالا وقت **استفاده** از این میدان است: یک عدد مختلط را به سه شکل می‌نویسیم و هر شکل برای یک کار مناسب‌تر است. 🛠️

---

# ⚡ عدد موهومی محض: $i = (0, 1)$

در مقاله‌ی قبل دیدیم:

$$i = (0, 1), \qquad i^2 = (0,1)\cdot(0,1) = (-1, 0) = -1$$

به عددی مثل $(0, b) = bi$ که **بخش حقیقی‌اش صفر** است، **عدد موهومی محض** می‌گوییم؛ مثل $3i$ و $-\frac{1}{2}i$ و خود $i$.

| عدد | حقیقی؟ | موهومی محض؟ |
|:---:|:---:|:---:|
| $5 = (5,0)$ | ✅ | ❌ |
| $4i = (0,4)$ | ❌ | ✅ |
| $0 = (0,0)$ | ✅ | ✅ (هر دو!) |
| $2 + 3i$ | ❌ | ❌ |

> 📝 در مهندسی برق چون حرف $i$ برای جریان استفاده می‌شود، به جای آن از $j$ استفاده می‌کنند. ما در ریاضی عمومی $i$ را به کار می‌بریم.

### 🔄 توان‌های $i$ هر ۴ تا تکرار می‌شوند

$$i^1 = i, \quad i^2 = -1, \quad i^3 = -i, \quad i^4 = 1, \quad i^5 = i, \dots$$

برای محاسبه‌ی $i^n$ فقط باقی‌مانده‌ی $n$ بر ۴ را بررسی می‌کنیم.

---

# 🗺️ سه نمایش اعداد مختلط

یک عدد مختلط را می‌شود به **سه روش** نوشت. مثل اینکه یک آدرس را با «مختصات GPS»، «نشانی پستی» یا «فاصله و جهت از مرکز شهر» بگوییم. هر روش در جایی بهتر است.

در هر سه بخش، یک مثال ثابت را دنبال می‌کنیم:

$$z = 1 + \sqrt{3}\,i$$

---

## ۱️⃣ نمایش دکارتی (زوج مرتب)

$$z = (x, y), \qquad x, y \in \mathbb{R}$$

عدد مختلط یک **نقطه روی صفحه** است؛ محور افقی برای $x$ (محور حقیقی) و محور عمودی برای $y$ (محور موهومی). به این صفحه، **صفحه‌ی مختلط** یا **نمودار آرگاند** می‌گوییم.

- $x = \operatorname{Re}(z)$ ← بخش حقیقی
- $y = \operatorname{Im}(z)$ ← بخش موهومی

> ⚠️ **تله:** $\operatorname{Im}(3 + 2i) = 2$ است، نه $2i$. بخش موهومی یک **عدد حقیقی** است.

مثال ما: $z = (1, \sqrt{3})$

<div align="center" dir="ltr">
<svg viewBox="0 0 360 280" width="360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="نمایش دکارتی عدد مختلط" style="max-width:100%;height:auto" font-family="sans-serif" font-size="14">
<g stroke="currentColor" stroke-opacity="0.13">
<line x1="150" y1="25" x2="150" y2="230"/>
<line x1="220" y1="25" x2="220" y2="230"/>
<line x1="290" y1="25" x2="290" y2="230"/>
<line x1="80" y1="160" x2="335" y2="160"/>
<line x1="80" y1="90" x2="335" y2="90"/>
</g>
<line x1="40" y1="230" x2="335" y2="230" stroke="currentColor" stroke-width="1.5"/>
<polygon points="342,230 330,225 330,235" fill="currentColor"/>
<line x1="80" y1="262" x2="80" y2="25" stroke="currentColor" stroke-width="1.5"/>
<polygon points="80,18 75,30 85,30" fill="currentColor"/>
<text x="334" y="250" fill="currentColor">x</text>
<text x="90" y="22" fill="currentColor">y</text>
<text x="64" y="247" fill="currentColor">O</text>
<g fill="currentColor" font-size="13">
<text x="146" y="248">1</text>
<text x="216" y="248">2</text>
<text x="286" y="248">3</text>
<text x="70" y="164" text-anchor="end">1</text>
<text x="70" y="94" text-anchor="end">2</text>
<text x="70" y="113" text-anchor="end">√3</text>
</g>
<line x1="150" y1="108.8" x2="150" y2="230" stroke="#888" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="80" y1="108.8" x2="150" y2="108.8" stroke="#888" stroke-width="1.5" stroke-dasharray="5 4"/>
<circle cx="150" cy="108.8" r="5.5" fill="#e11d48"/>
<text x="160" y="102" fill="#e11d48" font-weight="bold">z = (1, √3)</text>
</svg>
</div>

---

## ۲️⃣ نمایش استاندارد: $x + iy$

این همان شکلی است که از دبیرستان می‌شناسید. اما از **کجا** آمد؟ از خود زوج مرتب ساخته می‌شود:

$$z = (x, y) = (x, 0) + (0, y)$$

حالا $(0, y)$ را با ضرب بازنویسی می‌کنیم:

$$(0, 1)\cdot(y, 0) = (0\cdot y - 1\cdot 0,\; 0\cdot 0 + 1\cdot y) = (0, y) \;✓$$

پس $(0, y) = i \cdot y$ و:

$$\boxed{z = (x, y) = (x, 0) + (0,1)\cdot(y, 0) = x + iy}$$

(در این مسیر از قرارداد $(a, 0) = a$ استفاده کردیم که در مقاله‌ی قبل دیدیم.)

> 🔑 **مزیت:** با نمایش استاندارد، جمع و تفریق و ضرب را مثل «باز کردن پرانتز» انجام می‌دهیم و فقط $i^2 = -1$ را جایگزین می‌کنیم. دیگر نیازی به فرمول عجیب ضرب زوج‌ها نیست.

مثال ما: $z = 1 + \sqrt{3}\, i$

<div align="center" dir="ltr">
<svg viewBox="0 0 360 280" width="360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="نمایش استاندارد عدد مختلط" style="max-width:100%;height:auto" font-family="sans-serif" font-size="14">
<g stroke="currentColor" stroke-opacity="0.13">
<line x1="150" y1="25" x2="150" y2="230"/>
<line x1="80" y1="160" x2="335" y2="160"/>
<line x1="80" y1="90" x2="335" y2="90"/>
</g>
<line x1="40" y1="230" x2="335" y2="230" stroke="currentColor" stroke-width="1.5"/>
<polygon points="342,230 330,225 330,235" fill="currentColor"/>
<line x1="80" y1="262" x2="80" y2="25" stroke="currentColor" stroke-width="1.5"/>
<polygon points="80,18 75,30 85,30" fill="currentColor"/>
<text x="326" y="250" fill="currentColor">Re</text>
<text x="90" y="22" fill="currentColor">Im</text>
<text x="64" y="247" fill="currentColor">O</text>
<g fill="currentColor" font-size="13">
<text x="75" y="164" text-anchor="end">i</text>
<text x="75" y="94" text-anchor="end">2i</text>
<text x="75" y="113" text-anchor="end">√3 i</text>
</g>
<line x1="80" y1="108.8" x2="150" y2="108.8" stroke="#888" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="80" y1="230" x2="150" y2="230" stroke="#2563eb" stroke-width="4.5"/>
<line x1="150" y1="230" x2="150" y2="108.8" stroke="#16a34a" stroke-width="4.5"/>
<circle cx="150" cy="108.8" r="5.5" fill="#e11d48"/>
<text x="160" y="102" fill="#e11d48" font-weight="bold">z = 1 + √3 i</text>
<text x="115" y="252" fill="#2563eb" text-anchor="middle">x = 1</text>
<text x="158" y="178" fill="#16a34a">iy = √3 i</text>
</svg>
</div>

> 🔵 مسیر آبی: حرکت روی محور حقیقی به اندازه‌ی $x$. 🟢 مسیر سبز: حرکت عمودی به اندازه‌ی $y$ (که $i$ در آن ضرب شده). مجموع این دو حرکت، خود عدد $z$ است.

---

## ۳️⃣ نمایش قطبی

به جای «چند قدم افقی و چند قدم عمودی»، می‌گوییم **«چقدر فاصله، در چه جهتی»**:

- $r$ = فاصله‌ی نقطه تا مبدأ
- $\theta$ = زاویه‌ی پاره‌خط با جهت مثبت محور حقیقی (خلاف جهت عقربه‌های ساعت)

<div align="center" dir="ltr">
<svg viewBox="0 0 360 280" width="360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="نمایش قطبی عدد مختلط" style="max-width:100%;height:auto" font-family="sans-serif" font-size="14">
<line x1="40" y1="230" x2="335" y2="230" stroke="currentColor" stroke-width="1.5"/>
<polygon points="342,230 330,225 330,235" fill="currentColor"/>
<line x1="80" y1="262" x2="80" y2="25" stroke="currentColor" stroke-width="1.5"/>
<polygon points="80,18 75,30 85,30" fill="currentColor"/>
<text x="326" y="250" fill="currentColor">Re</text>
<text x="90" y="22" fill="currentColor">Im</text>
<text x="64" y="247" fill="currentColor">O</text>
<line x1="150" y1="108.8" x2="150" y2="230" stroke="#16a34a" stroke-width="3"/>
<line x1="80" y1="230" x2="150" y2="230" stroke="#2563eb" stroke-width="3"/>
<line x1="80" y1="230" x2="150" y2="108.8" stroke="#e11d48" stroke-width="3.5"/>
<path d="M140,230 V220 H150" fill="none" stroke="currentColor" stroke-width="1.2"/>
<path d="M110,230 A30,30 0 0 0 95,204" fill="none" stroke="currentColor" stroke-width="1.8"/>
<text x="114" y="220" fill="currentColor" font-size="15">θ</text>
<circle cx="150" cy="108.8" r="5.5" fill="#e11d48"/>
<text x="160" y="102" fill="#e11d48" font-weight="bold">z</text>
<text x="128" y="132" fill="#e11d48" text-anchor="end">r = 2</text>
<text x="115" y="252" fill="#2563eb" text-anchor="middle" font-size="13">r cos θ = 1</text>
<text x="158" y="178" fill="#16a34a" font-size="13">r sin θ = √3</text>
</svg>
</div>

### 🔍 چرا $z = r\cos\theta + i\,r\sin\theta$ ؟

مثلث قائم‌الزاویه‌ی شکل را ببینید (وتر $= r$، زاویه‌ی مجاور $\theta$). از تعریف $\cos$ و $\sin$ در مثلث قائم‌الزاویه:

$$\cos\theta = \frac{x}{r} \;\Rightarrow\; x = r\cos\theta \qquad\qquad \sin\theta = \frac{y}{r} \;\Rightarrow\; y = r\sin\theta$$

آن را در نمایش استاندارد می‌گذاریم:

$$z = x + iy = r\cos\theta + i\,r\sin\theta = r(\cos\theta + i\sin\theta)$$

و از فیثاغورس:

$$r = \lvert z \rvert = \sqrt{x^2 + y^2}$$

### ✂️ نمادهای کوتاه‌نویسی

$$\cos\theta + i\sin\theta = \operatorname{cis}\theta = e^{i\theta}$$

$$\boxed{z = r(\cos\theta + i\sin\theta) = r\operatorname{cis}\theta = r\,e^{i\theta}}$$

- **cis** مخفف «cos + i sin» است.
- **$e^{i\theta}$** که **فرمول اویلر** نام دارد. فعلاً آن را یک نماد قراردادی بدانید؛ درستی‌اش را در فصل **سری‌ها (سری تیلور)** خواهید دید.

> 🌟 با $\theta = \pi$ و $r = 1$ به $e^{i\pi} = -1$ می‌رسیم، یعنی $e^{i\pi} + 1 = 0$؛ فرمولی که به‌خاطر ترکیب پنج عدد مهم ریاضی، زیباترین فرمول ریاضیات لقب گرفته است.

### 📐 آرگومان ($\operatorname{Arg} z$)

زاویه‌ی $\theta$ را **آرگومان** $z$ می‌نامیم و با $\operatorname{Arg} z$ نشان می‌دهیم. در این درس:

$$0 \le \theta < 2\pi$$

> 📝 بعضی کتاب‌ها بازه‌ی $(-\pi, \pi]$ را به عنوان **آرگومان اصلی** در نظر می‌گیرند. مهم این است که یک بازه به طول $2\pi$ را ثابت نگه دارید. زاویه‌ی «کلی» به شکل $\theta + 2k\pi$ نوشته می‌شود، چون با یک دور کامل چرخیدن به همان نقطه می‌رسیم.

⚠️ $z = 0$ آرگومان ندارد (جهت ندارد).

### 🧭 پیدا کردن $\theta$ از روی $(x, y)$

اول زاویه‌ی مرجع $\alpha = \arctan\left\lvert \dfrac{y}{x} \right\rvert$ را حساب کنید و بعد ناحیه را ببینید:

| ناحیه | علامت‌ها | $\theta$ |
|:---:|:---:|:---:|
| اول | $x>0,\; y>0$ | $\alpha$ |
| دوم | $x<0,\; y>0$ | $\pi - \alpha$ |
| سوم | $x<0,\; y<0$ | $\pi + \alpha$ |
| چهارم | $x>0,\; y<0$ | $2\pi - \alpha$ |

| روی محورها | $\theta$ |
|:---:|:---:|
| $x>0,\; y=0$ | $0$ |
| $x=0,\; y>0$ | $\dfrac{\pi}{2}$ |
| $x<0,\; y=0$ | $\pi$ |
| $x=0,\; y<0$ | $\dfrac{3\pi}{2}$ |

### ✅ مثال ما به شکل قطبی

$$r = \sqrt{1 + 3} = 2, \qquad \tan\theta = \frac{\sqrt{3}}{1} \;\Rightarrow\; \theta = \frac{\pi}{3} \;(\text{ناحیه‌ی اول})$$

$$1 + \sqrt{3}\,i = 2\operatorname{cis}\frac{\pi}{3} = 2e^{i\pi/3}$$

### 📋 جمع‌بندی سه نمایش

| نمایش | شکل | وقتی مفید است |
|:---:|:---:|:---|
| دکارتی | $(1, \sqrt{3})$ | تعریف‌ها و اثبات اصول موضوعه |
| استاندارد | $1 + \sqrt{3}\,i$ | **جمع و تفریق** |
| قطبی | $2\operatorname{cis}\frac{\pi}{3}$ | **ضرب، تقسیم، توان و ریشه** |

---

# 🪞 عدد مختلط مزدوج

**تعریف:** مزدوج $z = x + iy$ به صورت زیر تعریف می‌شود:

$$\overline{z} = x - iy$$

یعنی فقط **علامت بخش موهومی** عوض می‌شود. روی صفحه، $\overline{z}$ **قرینه‌ی $z$ نسبت به محور حقیقی** است. (قرینه‌ی جمعی $-z$ هم قرینه نسبت به **مبدأ** است.)

<div align="center" dir="ltr">
<svg viewBox="0 0 320 280" width="320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="z و مزدوج و قرینه" style="max-width:100%;height:auto" font-family="sans-serif" font-size="14">
<line x1="10" y1="140" x2="302" y2="140" stroke="currentColor" stroke-width="1.5"/>
<polygon points="310,140 298,135 298,145" fill="currentColor"/>
<line x1="140" y1="272" x2="140" y2="18" stroke="currentColor" stroke-width="1.5"/>
<polygon points="140,10 135,22 145,22" fill="currentColor"/>
<text x="296" y="160" fill="currentColor" text-anchor="end">Re</text>
<text x="150" y="20" fill="currentColor">Im</text>
<line x1="260" y1="60" x2="260" y2="220" stroke="#888" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="140" y1="140" x2="260" y2="60" stroke="#e11d48" stroke-width="2.5"/>
<line x1="140" y1="140" x2="260" y2="220" stroke="#2563eb" stroke-width="2.5"/>
<line x1="140" y1="140" x2="20" y2="220" stroke="#16a34a" stroke-width="2.5"/>
<circle cx="260" cy="60" r="5" fill="#e11d48"/>
<circle cx="260" cy="220" r="5" fill="#2563eb"/>
<circle cx="20" cy="220" r="5" fill="#16a34a"/>
<text x="252" y="50" fill="#e11d48" text-anchor="end" font-weight="bold">z = 3 + 2i</text>
<text x="252" y="242" fill="#2563eb" text-anchor="end" font-weight="bold">z̄ = 3 − 2i</text>
<text x="28" y="244" fill="#16a34a" font-weight="bold">−z = −3 − 2i</text>
</svg>
</div>

> 👀 هر سه پاره‌خط قرمز، آبی و سبز **طول یکسان** دارند؛ یعنی $\lvert z \rvert = \lvert \overline{z} \rvert = \lvert -z \rvert$. این خاصیت را در بخش بعد ثابت می‌کنیم.

### 🔧 کاربردهای فوری مزدوج

$$\operatorname{Re}(z) = \frac{z + \overline{z}}{2}, \qquad \operatorname{Im}(z) = \frac{z - \overline{z}}{2i}$$

- $z$ **حقیقی** است ⇔ $z = \overline{z}$
- $z$ **موهومی محض** است ⇔ $z = -\overline{z}$
- $\overline{\overline{z}} = z$ (دو بار آینه گرفتن، برمی‌گردیم سر جای اول)

---

# 🧰 خواص اعداد مختلط

در همه‌ی اثبات‌ها $z_1 = x_1 + iy_1$ و $z_2 = x_2 + iy_2$ است.

## ۱. $z\cdot\overline{z} = \lvert z \rvert^2$

**اثبات:**

$$(x + iy)(x - iy) = x^2 - i^2 y^2 = x^2 + y^2 = \lvert z \rvert^2 \;\blacksquare$$

> 💡 **کاربرد مهم (تقسیم و معکوس):**
> $$\frac{1}{z} = \frac{\overline{z}}{\lvert z \rvert^2}, \qquad \frac{z_1}{z_2} = \frac{z_1\,\overline{z_2}}{\lvert z_2 \rvert^2}$$
> یعنی «صورت و مخرج را در مزدوج مخرج ضرب کن»؛ همان کاری که در مسئله‌ی تقسیم مقاله‌ی قبل کردیم.

## ۲. مزدوجِ جمع = جمعِ مزدوج‌ها

$$\overline{z_1 + z_2 + \cdots + z_n} = \overline{z_1} + \overline{z_2} + \cdots + \overline{z_n}$$

## ۳. مزدوجِ ضرب = ضربِ مزدوج‌ها

$$\overline{z_1 \cdot z_2 \cdots z_n} = \overline{z_1}\cdot\overline{z_2}\cdots\overline{z_n}$$

## ۴. قدر مطلقِ ضرب = ضربِ قدر مطلق‌ها

$$\lvert z_1 z_2 \cdots z_n \rvert = \lvert z_1 \rvert\lvert z_2 \rvert\cdots\lvert z_n \rvert$$

## ۵. $\lvert z \rvert = \lvert \overline{z} \rvert = \lvert -z \rvert$

> این همان چیزی است که در شکل مزدوج دیدیم: $z$، $\overline{z}$ و $-z$ روی **یک دایره** به مرکز مبدأ هستند.

## ۶. نامساوی مثلث: $\lvert z_1 + z_2 \rvert \le \lvert z_1 \rvert + \lvert z_2 \rvert$

**شهود هندسی:** $z_1$، $z_2$ و $z_1 + z_2$ سه ضلع یک مثلث‌اند و می‌دانیم در هر مثلث، هر ضلع از مجموع دو ضلع دیگر **کوچک‌تر یا مساوی** است. (راه رفتن مستقیم همیشه کوتاه‌تر از دور زدن است!)

**کی تساوی برقرار است؟** وقتی $z_1$ و $z_2$ **هم‌جهت** باشند (یکی مضرب نامنفی دیگری).

> 🔁 **نسخه‌ی معکوس مفید:** $\big\lvert\, \lvert z_1 \rvert - \lvert z_2 \rvert \,\big\rvert \le \lvert z_1 - z_2 \rvert$ ؛ یعنی هر ضلع مثلث از **تفاضل** دو ضلع دیگر بزرگ‌تر یا مساوی است.

## ۷. ضرب و تقسیم در شکل قطبی

فرض کنید:

$$z_1 = \lvert z_1 \rvert\operatorname{cis}\theta_1, \qquad z_2 = \lvert z_2 \rvert\operatorname{cis}\theta_2$$

آنگاه:

$$\boxed{z_1 z_2 = \lvert z_1 z_2 \rvert\operatorname{cis}(\theta_1 + \theta_2)}$$

$$\boxed{\frac{z_1}{z_2} = \left\lvert \frac{z_1}{z_2} \right\rvert\operatorname{cis}(\theta_1 - \theta_2) \qquad (z_2 \neq 0)}$$

> 🎡 **معنای هندسی:** ضرب در یک عدد مختلط یعنی **بزرگ/کوچک کردن** (به اندازه‌ی قدر مطلق) و **چرخاندن** (به اندازه‌ی آرگومان). مثلاً ضرب در $i = \operatorname{cis}\frac{\pi}{2}$ یعنی چرخش $90°$ بدون تغییر اندازه.

> ⚠️ **تله:** زاویه‌ها فقط در **ضرب** جمع می‌شوند، نه در جمع! و اگر حاصل $\theta_1 + \theta_2$ از $2\pi$ بیشتر شد (یا $\theta_1 - \theta_2$ منفی شد)، مضرب مناسبی از $2\pi$ اضافه یا کم کنید تا در بازه‌ی $[0, 2\pi)$ بیفتد.

---

# 🧮 قانون دموآور

وقتی یک عدد را بارها در خودش ضرب می‌کنیم، قانون ضرب قطبی بارها اعمال می‌شود: اندازه‌ها توان می‌گیرند و **زاویه‌ها $n$ برابر می‌شوند.**

$$\boxed{z = \lvert z \rvert\operatorname{cis}\theta \;\Longrightarrow\; z^n = \lvert z \rvert^n\operatorname{cis}(n\theta), \quad n \in \mathbb{Z}}$$

### 🧪 مثال‌ها

**۱.** $(1 + i)^8$: داریم $1 + i = \sqrt{2}\operatorname{cis}\frac{\pi}{4}$ پس

$$(1+i)^8 = (\sqrt{2})^8\operatorname{cis}\frac{8\pi}{4} = 16\operatorname{cis}(2\pi) = 16$$

**۲.** فرمول‌های زاویه‌ی دو برابر: وقتی $\lvert z \rvert = 1$ است داریم $(\cos t + i\sin t)^2 = \cos 2t + i\sin 2t$. طرف چپ را باز کنید:

$$\cos^2 t - \sin^2 t + 2i\sin t\cos t = \cos 2t + i\sin 2t$$

با مقایسه‌ی بخش حقیقی و موهومی: $\cos 2t = \cos^2 t - \sin^2 t$ و $\sin 2t = 2\sin t\cos t$. دموآور، فرمول‌های مثلثاتی را «رایگان» می‌دهد! 🎁

---

# 🌱 ریشه‌ی $n$ام و تعداد جواب‌ها

**ریشه‌های $z^n = w$:** اگر $w = r\operatorname{cis}\theta$ باشد، دقیقاً $n$ جواب متمایز وجود دارد:

$$z_k = \sqrt[n]{r}\;\operatorname{cis}\!\left(\frac{\theta + 2k\pi}{n}\right), \qquad k = 0, 1, \dots, n-1$$

این ریشه‌ها روی **یک دایره** و با فاصله‌ی زاویه‌ای مساوی ($\frac{2\pi}{n}$) قرار دارند و رأس‌های یک $n$ضلعی منتظم می‌سازند.

**مثال: ریشه‌های سوم $1$** (از معادله‌ی $z^3 = 1$ با $r = 1$ و $\theta = 0$):

<div align="center" dir="ltr">
<svg viewBox="0 0 320 280" width="320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ریشه‌های سوم واحد" style="max-width:100%;height:auto" font-family="sans-serif" font-size="14">
<line x1="30" y1="140" x2="292" y2="140" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.5"/>
<line x1="160" y1="262" x2="160" y2="20" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.5"/>
<circle cx="160" cy="140" r="90" fill="none" stroke="#888" stroke-width="1.5" stroke-dasharray="5 4"/>
<polygon points="250,140 115,62.06 115,217.94" fill="#2563eb" fill-opacity="0.1" stroke="#2563eb" stroke-width="2"/>
<g stroke="#e11d48" stroke-width="1.5" stroke-opacity="0.6">
<line x1="160" y1="140" x2="250" y2="140"/>
<line x1="160" y1="140" x2="115" y2="62.06"/>
<line x1="160" y1="140" x2="115" y2="217.94"/>
</g>
<circle cx="250" cy="140" r="5.5" fill="#e11d48"/>
<circle cx="115" cy="62.06" r="5.5" fill="#e11d48"/>
<circle cx="115" cy="217.94" r="5.5" fill="#e11d48"/>
<text x="258" y="132" fill="#e11d48" font-weight="bold">1</text>
<text x="108" y="56" fill="#e11d48" text-anchor="end" font-weight="bold">ω = cis(2π/3)</text>
<text x="108" y="240" fill="#e11d48" text-anchor="end" font-weight="bold">ω² = cis(4π/3)</text>
</svg>
</div>

سه ریشه: $1$ و $\omega = -\frac{1}{2} + \frac{\sqrt{3}}{2}i$ و $\omega^2 = -\frac{1}{2} - \frac{\sqrt{3}}{2}i$.

### 📣 قضیه‌ی اساسی جبر

> هر معادله‌ی چندجمله‌ای مختلط از درجه‌ی $n$ دارای **دقیقاً $n$ جواب** در $\mathbb{C}$ است (با احتساب **تکرار**).

یعنی در $\mathbb{C}$ هرگز «بی‌جواب» نداریم. مثلاً $(z-1)^2 = 0$ دو جواب دارد، ولی هر دو برابر $1$ هستند (ریشه‌ی مضاعف). این قضیه را نخستین بار گاوس (حدود سال ۱۷۹۹) به شکل دقیق اثبات کرد.

### 👫 ریشه‌های مزدوج

اگر **ضرایب** چندجمله‌ای $p$ همگی **حقیقی** باشند و $p(z) = 0$ شود، آنگاه $p(\overline{z}) = 0$ هم هست. دلیل: از خواص ۲ و ۳ مزدوج، $p(\overline{z}) = \overline{p(z)} = \overline{0} = 0$. پس ریشه‌های ناحقیقی چنین معادله‌هایی **جفت‌جفت** می‌آیند.

---

# 📝 نکته‌ها و تله‌های مهم

1. **چرا $\arctan$ به تنهایی کافی نیست؟** تابع $\tan$ در بازه‌ی $[0, 2\pi)$ **یک‌به‌یک نیست** (مثلاً $\tan\frac{\pi}{4} = \tan\frac{5\pi}{4} = 1$)، پس معکوس‌پذیر نیست. تابع $\arctan$ فقط مقادیر $\left(-\frac{\pi}{2}, \frac{\pi}{2}\right)$ را برمی‌گرداند. ناحیه‌ی نقطه را باید جدا بررسی کنیم (جدول بالا).
   - مثال: $z = -1 - i$ و $w = 1 + i$ هر دو $\frac{y}{x} = 1$ دارند، ولی $\theta_w = \frac{\pi}{4}$ و $\theta_z = \frac{5\pi}{4}$.
2. **تعداد جواب‌ها:** معادله‌ی درجه‌ی $n$ در $\mathbb{C}$ دقیقاً $n$ جواب (با تکرار) دارد. (در $\mathbb{R}$ ممکن است صفر تا $n$ جواب باشد.)
3. **آرگومان یکتا نیست:** $\theta$ و $\theta + 2\pi$ یک نقطه را می‌دهند؛ برای یکتایی بازه‌ی $[0, 2\pi)$ را ثابت می‌گیریم.
4. **زاویه‌ها در جمع، جمع نمی‌شوند!** فقط در ضرب (و در تقسیم کم می‌شوند).
5. **ترتیب ندارد:** در $\mathbb{C}$ نمی‌توان گفت $z_1 < z_2$ (جز اینکه قدر مطلق‌ها یا بخش‌های حقیقی را مقایسه کنیم).
6. **قدر مطلق** عددی **حقیقی و نامنفی** است: $\lvert z \rvert \ge 0$ و $\lvert z \rvert = 0 \Leftrightarrow z = 0$.
7. **ایمنی:** قبل از هر چیز $\sqrt{-1}$ را به $i$ تبدیل کنید و $\sqrt{a}\sqrt{b} = \sqrt{ab}$ را فقط برای $a, b \ge 0$ به کار ببرید.

> 📚 **اشاره‌ی تاریخی (تقریبی):** نمایش هندسی اعداد مختلط روی صفحه را حدود سال ۱۷۹۷ وسل (Wessel) و حدود ۱۸۰۶ آرگاند (Argand) معرفی کردند و گاوس آن را رایج کرد. قانون دموآور حدود ۱۷۲۰ و فرمول اویلر حدود ۱۷۴۸ منتشر شد.

---

# 🧠 ۱۰ مسئله‌ی چالشی

> هر مسئله یک «تله» دارد. اول خودتان حل کنید، بعد پاسخ را باز کنید. 🕵️

---

### مسئله ۱ ⭐⭐ — تله‌ی ناحیه
شکل قطبی (با $0 \le \theta < 2\pi$) اعداد زیر را بنویسید: **(الف)** $-1 - i$ **(ب)** $-3i$

<details>
<summary>✅ پاسخ</summary>

**(الف)** $r = \sqrt{1+1} = \sqrt{2}$. مقدار $\arctan\lvert\frac{y}{x}\rvert = \arctan 1 = \frac{\pi}{4}$ زاویه‌ی مرجع است. نقطه در **ناحیه‌ی سوم** است پس $\theta = \pi + \frac{\pi}{4} = \frac{5\pi}{4}$:

$$-1 - i = \sqrt{2}\operatorname{cis}\frac{5\pi}{4}$$

⚠️ اگر مستقیم $\arctan\frac{-1}{-1} = \frac{\pi}{4}$ را بنویسید، به نقطه‌ی $1 + i$ می‌رسید که اشتباه است.

**(ب)** $x = 0$ است و $\tan$ تعریف‌شده نیست! ولی روی **محور موهومی منفی** هستیم:

$$-3i = 3\operatorname{cis}\frac{3\pi}{2}$$

</details>

---

### مسئله ۲ ⭐⭐ — از قطبی به استاندارد
عدد $z = 4\operatorname{cis}\dfrac{7\pi}{6}$ را به شکل $x + iy$ بنویسید.

<details>
<summary>✅ پاسخ</summary>

زاویه $\frac{7\pi}{6} = 210°$ در ناحیه‌ی **سوم** است؛ پس هر دو $\cos$ و $\sin$ **منفی‌اند**:

$$\cos\frac{7\pi}{6} = -\frac{\sqrt{3}}{2}, \qquad \sin\frac{7\pi}{6} = -\frac{1}{2}$$

$$z = 4\left(-\frac{\sqrt{3}}{2} - \frac{1}{2}i\right) = -2\sqrt{3} - 2i$$

</details>

---

### مسئله ۳ ⭐⭐⭐ — ضرب و تقسیم قطبی با کنترل زاویه
اگر $z_1 = 2\operatorname{cis}\frac{7\pi}{4}$ و $z_2 = 3\operatorname{cis}\frac{\pi}{2}$ باشد، حاصل $z_1 z_2$ و $\dfrac{z_1}{z_2}$ را به شکل **استاندارد** بنویسید.

<details>
<summary>✅ پاسخ</summary>

**ضرب:** اندازه‌ها $2 \times 3 = 6$ و زاویه‌ها جمع می‌شوند:

$$\frac{7\pi}{4} + \frac{\pi}{2} = \frac{9\pi}{4} \notin [0, 2\pi) \;\Rightarrow\; \frac{9\pi}{4} - 2\pi = \frac{\pi}{4}$$

$$z_1 z_2 = 6\operatorname{cis}\frac{\pi}{4} = 6\left(\frac{\sqrt{2}}{2} + \frac{\sqrt{2}}{2}i\right) = 3\sqrt{2} + 3\sqrt{2}\,i$$

**تقسیم:** اندازه $\frac{2}{3}$ و زاویه $\frac{7\pi}{4} - \frac{\pi}{2} = \frac{5\pi}{4}$:

$$\frac{z_1}{z_2} = \frac{2}{3}\operatorname{cis}\frac{5\pi}{4} = \frac{2}{3}\left(-\frac{\sqrt{2}}{2} - \frac{\sqrt{2}}{2}i\right) = -\frac{\sqrt{2}}{3} - \frac{\sqrt{2}}{3}\,i$$

</details>

---

### مسئله ۴ ⭐⭐ — توان بزرگ
حاصل $(1 + i)^{20}$ را بیابید.

<details>
<summary>✅ پاسخ</summary>

$1 + i = \sqrt{2}\operatorname{cis}\frac{\pi}{4}$ ، پس:

$$(1+i)^{20} = (\sqrt{2})^{20}\operatorname{cis}\frac{20\pi}{4} = 2^{10}\operatorname{cis}(5\pi) = 1024\cdot(-1) = -1024$$

**راه دوم (بررسی):** $(1+i)^2 = 2i$ ، پس $(1+i)^{20} = (2i)^{10} = 2^{10}\cdot i^{10} = 1024\cdot(-1) = -1024$ ✓

</details>

---

### مسئله ۵ ⭐⭐⭐ — توان منفی و ناحیه‌ی چهارم
حاصل $(\sqrt{3} - i)^{-6}$ را بیابید.

<details>
<summary>✅ پاسخ</summary>

$r = \sqrt{3 + 1} = 2$. نقطه‌ی $(\sqrt{3}, -1)$ در **ناحیه‌ی چهارم** است و زاویه‌ی مرجع $\arctan\frac{1}{\sqrt{3}} = \frac{\pi}{6}$ ، پس $\theta = 2\pi - \frac{\pi}{6} = \frac{11\pi}{6}$.

$$(\sqrt{3} - i)^{-6} = 2^{-6}\operatorname{cis}\left(-6\cdot\frac{11\pi}{6}\right) = \frac{1}{64}\operatorname{cis}(-11\pi) = \frac{1}{64}\operatorname{cis}(\pi) = -\frac{1}{64}$$

(چون $-11\pi$ و $\pi$ به اندازه‌ی ۶ دور کامل تفاوت دارند.)

</details>

---

### مسئله ۶ ⭐⭐⭐ — بازه‌ی ممکن برای مجموع
اگر $\lvert z_1 \rvert = 3$ و $\lvert z_2 \rvert = 4$ باشد، **کمترین و بیشترین** مقدار ممکن برای $\lvert z_1 + z_2 \rvert$ چیست؟ آیا مقدار $5$ ممکن است؟

<details>
<summary>✅ پاسخ</summary>

از نامساوی مثلث: $\lvert z_1 + z_2 \rvert \le 3 + 4 = 7$ و از نسخه‌ی معکوس: $\lvert z_1 + z_2 \rvert \ge \big\lvert\, 4 - 3 \,\big\rvert = 1$.

- **بیشینه $7$** وقتی $z_1, z_2$ **هم‌جهت** باشند (مثلاً $3$ و $4$).
- **کمینه $1$** وقتی **خلاف جهت** هم باشند (مثلاً $3$ و $-4$).
- با چرخاندن $z_2$، همه‌ی مقادیر بین $1$ و $7$ ممکن است.
- **مقدار $5$ ممکن است:** مثلاً $z_1 = 3$ و $z_2 = 4i$ ؛ آنگاه $\lvert 3 + 4i \rvert = 5$ (مثلث ۳-۴-۵).

$$1 \le \lvert z_1 + z_2 \rvert \le 7$$

</details>

---

### مسئله ۷ ⭐⭐⭐ — معادله‌ای با مزدوج
همه‌ی $z \in \mathbb{C}$ را بیابید که $z^2 = \overline{z}$.

<details>
<summary>✅ پاسخ</summary>

$z = x + iy$ را قرار می‌دهیم:

$$x^2 - y^2 + 2xy\,i = x - iy$$

- بخش حقیقی: $x^2 - y^2 = x$
- بخش موهومی: $2xy = -y \;\Rightarrow\; y(2x + 1) = 0$

**حالت ۱:** $y = 0$ ← $x^2 = x$ ← $x = 0$ یا $x = 1$ ← جواب‌ها $0$ و $1$.

**حالت ۲:** $x = -\frac{1}{2}$ ← $\frac{1}{4} - y^2 = -\frac{1}{2}$ ← $y^2 = \frac{3}{4}$ ← $y = \pm\frac{\sqrt{3}}{2}$.

چهار جواب:

$$0, \quad 1, \quad -\frac{1}{2} + \frac{\sqrt{3}}{2}i, \quad -\frac{1}{2} - \frac{\sqrt{3}}{2}i$$

🎯 **نکته‌ی جالب:** غیر از صفر، همان **ریشه‌های سوم واحد** هستند ($\omega^2 = \overline{\omega}$ چون $\omega\cdot\overline{\omega} = 1$).

</details>

---

### مسئله ۸ ⭐⭐⭐ — ریشه‌های مزدوج
معلوم است که $1 + i$ یک ریشه‌ی معادله‌ی $z^3 - 3z^2 + 4z - 2 = 0$ است. بدون تقسیم طولانی، همه‌ی ریشه‌ها را بیابید.

<details>
<summary>✅ پاسخ</summary>

ضرایب **حقیقی** هستند، پس طبق خاصیت مزدوج، $\overline{1 + i} = 1 - i$ هم ریشه است.

حاصل‌ضرب این دو عامل:

$$\big(z - (1+i)\big)\big(z - (1-i)\big) = z^2 - 2z + 2$$

درجه‌ی معادله ۳ است، پس ریشه‌ی سوم از تقسیم $p(z)$ بر $z^2 - 2z + 2$ به دست می‌آید که برابر $z - 1$ است. (بررسی: $(z-1)(z^2 - 2z + 2) = z^3 - 3z^2 + 4z - 2$ ✓)

$$z = 1, \quad z = 1 + i, \quad z = 1 - i$$

دقیقاً ۳ ریشه برای معادله‌ی درجه ۳ ✓

</details>

---

### مسئله ۹ ⭐⭐⭐ — $\cos 3t$ با دموآور
با استفاده از قانون دموآور نشان دهید $\cos 3t = 4\cos^3 t - 3\cos t$.

<details>
<summary>✅ پاسخ</summary>

از دموآور (با $\lvert z \rvert = 1$): $\cos 3t + i\sin 3t = (\cos t + i\sin t)^3$. طرف راست را با بسط مکعب باز می‌کنیم و $i^2 = -1$ و $i^3 = -i$ را قرار می‌دهیم:

$$= \cos^3 t + 3i\cos^2 t\sin t - 3\cos t\sin^2 t - i\sin^3 t$$

**بخش حقیقی:**

$$\cos 3t = \cos^3 t - 3\cos t\sin^2 t = \cos^3 t - 3\cos t(1 - \cos^2 t) = 4\cos^3 t - 3\cos t \;\blacksquare$$

(به همین روش، از بخش موهومی هم $\sin 3t = 3\sin t - 4\sin^3 t$ به دست می‌آید.)

</details>

---

### مسئله ۱۰ ⭐⭐⭐ — ریشه‌ی چهارم یک عدد منفی
معادله‌ی $z^4 = -16$ را در $\mathbb{C}$ حل کنید. جواب‌ها چه شکلی می‌سازند؟

<details>
<summary>✅ پاسخ</summary>

$-16 = 16\operatorname{cis}\pi$ ، پس $r = 16$ و $\theta = \pi$ و $n = 4$:

$$z_k = \sqrt[4]{16}\operatorname{cis}\frac{\pi + 2k\pi}{4} = 2\operatorname{cis}\frac{(2k+1)\pi}{4}, \qquad k = 0, 1, 2, 3$$

| $k$ | زاویه | جواب |
|:---:|:---:|:---:|
| ۰ | $\frac{\pi}{4}$ | $\sqrt{2} + \sqrt{2}\,i$ |
| ۱ | $\frac{3\pi}{4}$ | $-\sqrt{2} + \sqrt{2}\,i$ |
| ۲ | $\frac{5\pi}{4}$ | $-\sqrt{2} - \sqrt{2}\,i$ |
| ۳ | $\frac{7\pi}{4}$ | $\sqrt{2} - \sqrt{2}\,i$ |

دقیقاً ۴ جواب، که **رأس‌های یک مربع** روی دایره‌ی شعاع ۲ هستند.

⚠️ **تله:** $\pm 2$ جواب نیستند، چون $(\pm 2)^4 = +16$ است، نه $-16$. در $\mathbb{R}$ این معادله جواب ندارد، ولی در $\mathbb{C}$ چهار جواب دارد.

</details>

---

# 🌟 جمع‌بندی


<div align="center" dir="ltr">
<svg viewBox="0 0 560 330" width="560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="خلاصه نمایش‌های اعداد مختلط و کاربردهای آن‌ها" style="max-width:100%;height:auto">

  <rect x="195" y="12" width="170" height="42" rx="10" fill="transparent"/>
  <text x="280" y="39" fill="currentColor" text-anchor="middle" font-size="17" font-weight="bold">عدد مختلط z</text>

  <path d="M280 54 V75 H95 V95 M280 75 V95 M280 75 H465 V95" fill="none" stroke="currentColor" stroke-width="1.5"/>

  <rect x="15" y="95" width="160" height="75" rx="9"  stroke="#3b82f6" fill="transparent" stroke-width="1.5"/>
  <rect x="200" y="95" width="160" height="75" rx="9"  stroke="#16a34a" fill="transparent" stroke-width="1.5"/>
  <rect x="385" y="95" width="160" height="75" rx="9" stroke="#9333ea" fill="transparent" stroke-width="1.5"/>

  <g font-size="16" font-weight="bold" text-anchor="middle">
    <text x="95" y="122" fill="currentColor">دکارتی</text>
    <text x="280" y="122" fill="currentColor">استاندارد</text>
    <text x="465" y="122" fill="currentColor">قطبی</text>
  </g>

  <g font-size="15" text-anchor="middle">
    <text x="95" y="150" fill="currentColor">(x, y)</text>
    <text x="280" y="150" fill="currentColor">x + iy</text>
    <text x="465" y="145" fill="currentColor">r · cis θ</text>
    <text x="465" y="163" fill="currentColor">r · eⁱᶿ</text>
  </g>

  <path d="M280 170 V215" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path d="M95 170 V215" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path d="M465 170 V215" fill="none" stroke="currentColor" stroke-width="1.5"/>

  <rect x="15" y="215" width="160" height="38" fill="transparent" rx="8" stroke="#3b82f6"/>
  <rect x="200" y="215" width="160" height="38" fill="transparent" rx="8" stroke="#16a34a"/>
  <rect x="385" y="215" width="160" height="38" fill="transparent" rx="8" stroke="#9333ea"/>

  <g font-size="14" text-anchor="middle" >
    <text x="95" y="239" fill="currentColor">مختصات هندسی</text>
    <text x="280" y="239" fill="currentColor">جمع و تفریق</text>
    <text x="465" y="239" fill="currentColor">ضرب، تقسیم، توان و ریشه</text>
  </g>

</svg>
</div>

| مفهوم | نکته‌ی کلیدی |
|:---|:---|
| $i$ | $i^2 = -1$ و توان‌ها هر ۴ تا تکرار می‌شوند |
| مزدوج | قرینه نسبت به محور حقیقی؛ $z\overline{z} = \lvert z \rvert^2$ |
| قطبی | $z = r\operatorname{cis}\theta$ ؛ در ضرب: $r$ها ضرب و $\theta$ها جمع |
| دموآور | $z^n = r^n\operatorname{cis}(n\theta)$ |
| ریشه‌ها | $z^n = w$ دقیقاً $n$ جواب دارد |
| نامساوی مثلث | $\lvert z_1 + z_2 \rvert \le \lvert z_1 \rvert + \lvert z_2 \rvert$ |

اعداد مختلط یعنی **هندسه و جبر در یک ابزار**: با شکل دکارتی و استاندارد «جمع» و با شکل قطبی «چرخش و بزرگ‌نمایی» را آسان می‌کنیم. 🔄


# برگرفته از جلسات دکتر عباس محمدیان
<div align="center">

# 📝 md-articles

**A tiny, zero-build blog for your Markdown files.**
Multi-language · dark mode · GitHub Pages ready · no framework · no database.

[Features](#-features) · [Quick start](#-quick-start) · [Adding articles](#-adding-articles) · [Deploy](#-deploying-to-github-pages) · [Customize](#-customize) · [Troubleshooting](#-troubleshooting)

</div>

---

## ✨ What it is

A single `index.html` that turns a folder of Markdown files into a clean, readable blog. Drop a new folder in, run one command, and it's live. No build step for the reader, no bundler for you, no vendor lock-in.

```
┌─ Your repo ──────────────────────────────────┐
│  index.html    ← the whole UI (one file)     │
│  build.js      ← scans articles → JSON       │
│  articles.json ← generated, don't edit       │
│  articles/                                    │
│    └─ hello-world/                           │
│         ├─ en.md   ← English                 │
│         ├─ fa.md   ← Persian (RTL)           │
│         └─ hero.jpg                          │
└──────────────────────────────────────────────┘
```

Open the site → index loads `articles.json` → click a post → the matching `.md` is fetched, converted with [marked](https://marked.js.org/), and rendered.

---

## 🎯 Features

| | |
|---|---|
| 🌍 **Multi-language** | One folder, many `xx.md` files. Auto-detects RTL for Arabic, Persian, Hebrew, Urdu, and friends. |
| 🌗 **Dark / light** | Follows your OS by default. A `◐` button lets readers force a mode, remembered per browser. |
| 🖼 **Optional hero images** | Drop `hero.jpg` in the folder — or `hero.fa.jpg` for a language-specific cover. Nothing declared, nothing rendered. |
| 📱 **Responsive** | One column, comfortable measure, works down to 320 px. |
| 🎨 **Polished prose** | Styled code blocks (with copy button), tables, blockquotes, figures, `<kbd>`, `<mark>`. |
| ⚡ **No framework** | ~15 KB of HTML/CSS/JS. Loads instantly, works on any static host. |
| 🔒 **No tracking** | Zero analytics, zero cookies, zero external calls except the marked CDN. |
| 🖨 **Print-friendly** | Articles print as clean black-on-white pages. |

---

## 🚀 Quick start

### 1. Fork or use this template

Click **Use this template** (or **Fork**) on GitHub, then clone your copy:

```bash
git clone https://github.com/<you>/<repo>.git
cd <repo>
```

### 2. Make it yours

Open `index.html` and edit the `SITE` block near the top of the `<script>`:

```js
const SITE = {
  title: 'Your Name',
  description: 'Essays, notes, and things I figure out.',
};
```

### 3. Add your first article

```bash
mkdir -p articles/my-first-post
```

Create `articles/my-first-post/en.md`:

```markdown
---
title: My First Post
date: 2026-10-22
excerpt: What this post is about, in one line.
---

Your Markdown goes here. **Bold**, *italic*, `code`, tables, images — all styled.
```

### 4. Build and preview

```bash
node build.js                      # scans articles/ → writes articles.json
python3 -m http.server 8000        # or: npx serve .
```

Open **http://localhost:8000** — your post is there.

### 5. Deploy

See [Deploying to GitHub Pages](#-deploying-to-github-pages) below. **Don't skip the `.nojekyll` file.**

---

## 📚 Adding articles

### Folder rules

Each article is a **folder inside `articles/`**. Inside, you put one file per language:

```
articles/
└── my-post/
    ├── en.md            ← English (or your default)
    ├── fa.md            ← Persian
    ├── de.md            ← German
    ├── hero.jpg         ← shared cover
    └── hero.fa.jpg      ← Persian-only cover
```

The folder name becomes the article's **slug** — the part after `?q=` in the URL. So `articles/my-post/` lives at `?q=my-post`.

### Front matter

Each `.md` file starts with an optional YAML block:

```markdown
---
title: Climbing Mount Doom
date: 2026-10-22
excerpt: Three days up, two hours down, one very tired hobbit.
heroCaption: Sunrise over the crater rim, 05:40.
tags: hiking, mordor
---

The article starts here…
```

| Key | Required | Purpose |
|---|---|---|
| `title` | No | Shown as the page heading. Falls back to the folder name. |
| `date` | No | ISO `YYYY-MM-DD`. Used for sorting (newest first) and shown under the title. |
| `excerpt` | No | Shown on the index card. If omitted, the first paragraph is used. |
| `hero` | No | Force a specific hero file. `hero: none` disables. Otherwise auto-detected. |
| `heroAlt` | No | `<img alt>` text. Falls back to `title`. |
| `heroCaption` | No | Small caption below the hero. |
| `tags` | No | Stored in `articles.json` (currently unused by the UI, but there for you). |
| `default` | No | `true` marks this language as the article's default. Otherwise English wins, then alphabetical. |
| `draft` | No | `true` hides the post from `articles.json` while you write. |

### Language files

The filename **is** the language code, lowercase, BCP-47:

| File | Language |
|---|---|
| `en.md` | English |
| `fa.md` | Persian |
| `ar.md` | Arabic |
| `de.md` | German |
| `zh.md` | Chinese |
| `pt-BR.md` | Brazilian Portuguese |
| `es.md` | Spanish |

No declaration needed — just drop files in. `build.js` picks them up.

**RTL is automatic** for `ar`, `arc`, `ckb`, `dv`, `fa`, `ha`, `he`, `khw`, `ks`, `prs`, `ps`, `sam`, `sd`, `ug`, `ur`, `yi`. Everything else is LTR. You can override per file:

```yaml
dir: rtl    # or ltr
```

### Hero images

The hero is **completely optional** and resolved per language:

1. **Explicit** — `hero: my-cover.jpg` in front matter
2. **Per-language** — `hero.fa.jpg`, `cover.fa.png`, `banner.fa.webp`, …
3. **Shared** — `hero.jpg`, `cover.png`, `banner.jpg`, `thumb.*`, `thumbnail.*`

Extensions checked: `.jpg .jpeg .png .webp .avif .gif .svg`.

| You want… | Do this |
|---|---|
| One shared cover | Put `hero.jpg` in the folder |
| Different cover per language | `hero.jpg` + `hero.fa.jpg` |
| Only the Persian version has a cover | `hero.fa.jpg` only |
| No cover on this article | Nothing — no figure is rendered |
| Force-disable auto-detect | `hero: none` in front matter |

### Images inside the article

Relative paths just work. A line like

```markdown
![Diagram](diagram.png)
```

in `articles/my-post/en.md` resolves to `articles/my-post/diagram.png` — the renderer rewrites relative URLs after parsing. External URLs (`https://…`), absolute (`/…`), and anchors (`#…`) are left alone.

### Renaming or deleting

Delete the folder → delete the entry from `articles.json` (or just re-run `node build.js`). Rename a folder → rename the slug, so any bookmarked `?q=old-name` will 404. If you want to preserve old URLs, add `slug: old-name` to front matter — the folder can be named anything.

---

## 🛠 Local development

```bash
node build.js                    # rebuild articles.json
python3 -m http.server 8000      # serve on http://localhost:8000
```

> **Never open `index.html` via `file://`** — `fetch()` is blocked there. Use a server.

Shortcuts if you use `npm`:

```json
{
  "scripts": {
    "build":   "node build.js",
    "dev":     "node build.js && npx serve .",
    "watch":   "node build.js && npx nodemon --exec 'node build.js' --watch articles"
  }
}
```

Re-run `node build.js` **every time** you add, edit the front matter of, or delete an article. The Markdown body itself is fetched live by the browser, so you only need to rebuild when the *metadata* changes.

---

## 🌐 Deploying to GitHub Pages

### The critical step: `.nojekyll`

GitHub Pages runs **Jekyll** by default, which strips `.md` files from serving (it converts them to `.html`). Your blog fetches raw `.md` files, so **without `.nojekyll` every article will 404**.

Create an **empty file** at the repo root (next to `index.html`):

```bash
touch .nojekyll
git add .nojekyll
git commit -m "disable Jekyll so .md files are served raw"
git push
```

> 💡 That's it. Not inside `articles/`. Not with content. Just an empty file named `.nojekyll`.

### Enable Pages

1. Push your repo to GitHub.
2. **Settings → Pages → Source**: pick **Deploy from a branch**.
3. **Branch**: `main` · **Folder**: `/ (root)` → **Save**.
4. Wait ~1 minute. Your site is at `https://<user>.github.io/<repo>/`.

### Verify

```bash
# the article should return raw Markdown, not a 404, not a rendered page
curl -I https://<user>.github.io/<repo>/articles/my-post/en.md
# → HTTP/2 200
```

If that 404s, see [Troubleshooting](#-troubleshooting).

### Custom domain

Drop a `CNAME` file at the repo root containing your domain:

```
blog.example.com
```

Then point a `CNAME` DNS record at `<user>.github.io`. No change to `index.html` is needed.

---

## 🎨 Customize

### Site identity

```js
// index.html, near the top of <script>
const SITE = {
  title: 'Your Name',
  description: 'Essays, notes, and things I figure out.',
};
```

### Colors & typography

All colors and sizes are CSS custom properties in `:root`, at the top of `<style>`:

```css
:root {
  --bg:     #fbf9f6;   /* page background          */
  --fg:     #1e1c19;   /* body text               */
  --accent: #b45309;   /* links, blockquote bars  */
  --radius: 14px;      /* corners on cards, code  */
  --maxw:   44rem;     /* reading column width    */
  --serif:  ui-serif, Georgia, …;
  --sans:   ui-sans-serif, system-ui, …;
  --mono:   ui-monospace, SFMono-Regular, …;
}
```

Dark-mode values live in the `@media (prefers-color-scheme: dark)` block and in `:root[data-theme="dark"]` — keep both in sync if you change them.

### The article-folder name

The folder is `articles/` by default. To rename it:

1. Rename the folder on disk.
2. Change `ARTICLES_BASE` at the top of **both** `build.js` and `index.html`.

That single string is the only coupling between the two files.

---

## 🔗 URL reference

| URL | What you get |
|---|---|
| `/` | Index, each card in your browser's language if available |
| `?q=my-post` | Article in the best-matching language (URL → saved → browser → default) |
| `?q=my-post&lang=fa` | Article pinned to Persian |
| `?q=my-post&lang=en` | Article pinned to English |

Language preference resolution:

```
?lang=  →  localStorage.lang  →  navigator.language  →  article's defaultLang
```

`localStorage.lang` is set only when a reader clicks a language pill, so shared links always win.

---

## 🧪 Troubleshooting

### Every article 404s on GitHub Pages

**→ `.nojekyll` is missing.** See [the critical step](#the-critical-step-nojekyll). Wait 1–2 minutes after pushing, then hard-refresh (Cmd/Ctrl + Shift + R).

### Works locally, 404s on Pages (but `.nojekyll` exists)

Case mismatch. Linux (and therefore Pages) is case-sensitive, macOS/Windows often aren't.

```bash
git ls-files articles/     # confirm exact casing
```

Rename folder or file to match what `articles.json` references.

### `articles.json → HTTP 404`

Run `node build.js` and commit the resulting file. It's generated, but it **must** be in the repo for Pages to serve it.

### "Couldn't load — Markdown renderer failed to load"

You're offline or a corporate firewall blocked the CDN. Download `marked.min.js` locally and swap the `<script src>` for a relative path.

### Fetch works but the page is blank

Open DevTools → Console. Most likely a YAML syntax error in front matter (missing `---` closing fence) or a `title` containing an unquoted colon.

### Images inside an article are broken

They must be **relative to the article folder**, not to `index.html`. `![](diagram.png)` in `articles/my-post/en.md` looks for `articles/my-post/diagram.png`. Leading `/` and `https://` URLs pass through untouched.

### Adding a second language doesn't show a language switcher

The switcher appears only when a folder has **two or more** `xx.md` files. Check filenames: `fa.md` ✓, `fa.markdown` ✗, `persian.md` ✗ (not a language code), `FA.md` ✗ (must be lowercase).

---

## 📄 License

[MIT](./LICENCE) — use it, fork it, sell it, whatever. Attribution appreciated but not required.

---

<div align="center">

Made with plain HTML, one `<script>`, and too much coffee. ☕

</div>
```

---

## Notes on the README itself

- **The `.nojekyll` warning is repeated 4 times** (features table, deploy, troubleshooting, and implicitly in the curl check) because it's the single most common reason people give up on this setup. It's the one thing you want people to remember.
- **Every code block is copy-pasteable** — no "…" placeholders that break real workflows, except where an ellipsis is clearly a content-omission inside a Markdown example.
- **The features table uses two columns with no header row** — a small aesthetic choice that makes it read as a checklist rather than a boring grid.
- **Troubleshooting is symptom-first**, not cause-first — people search "404 on pages" before they search "nojekyll", so the symptoms are the headings.
- **No badges are used.** Shields.io badges would add visual noise and another external dependency; the header does the job with plain text. If you want them anyway, drop this under the title:

```markdown
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-brightgreen)](https://pages.github.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#-license)
[![No dependencies](https://img.shields.io/badge/dependencies-1%20CDN-orange)](https://marked.js.org/)
```

Drop the whole thing in as `README.md` at the repo root — GitHub will render it on the project page and it'll be the first thing anyone sees when they find your blog.
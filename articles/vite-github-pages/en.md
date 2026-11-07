---
title: Vite Apps + Github Pages
date: 2026-11-07
excerpt: Deploy Vite apps in Github pages
---


# Publishing a Vite App to GitHub Pages: A Complete Guide

Deploying a Vite application to GitHub Pages should be straightforward, but a few configuration details often trip people up—especially when the app lives in a subpath (`https://<username>.github.io/<repo-name>/`). This guide walks you through the entire process, from Vite configuration to GitHub Actions automation and troubleshooting common errors.

---

## 📋 Prerequisites

- A Vite project (React, Vue, Svelte, or vanilla).
- A GitHub repository.
- (Optional) pnpm if you use it locally—the workflow in this guide is tailored for pnpm, but you can adapt it to npm or yarn.

---

## Step 1: Set the Vite `base` Path

This is the **most critical step** for project sites. By default, Vite uses `base: '/'`, which assumes your app is served from the domain root. GitHub Pages project sites are served from `https://<username>.github.io/<repo-name>/`, so assets like CSS and JavaScript will be requested from `/assets/...` instead of `/<repo-name>/assets/...`, resulting in **404 errors** for every asset.

Open your `vite.config.ts` (or `vite.config.js`) and set `base` to match your repository name:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/<your-repo-name>/',   // e.g. '/my-portfolio/'
})
```

> **Note:** Include both the leading and trailing slash. The name must match your repository exactly (case-sensitive). If you are deploying to a **user or organization site** (`https://<username>.github.io/`) or using a **custom domain**, set `base: '/'` instead.

After this change, Vite will prefix all generated asset references with `/<your-repo-name>/`, and the built `dist/index.html` should contain paths like `/my-portfolio/assets/index-abc123.js`.

---

## Step 2: Handle Client-Side Routing (SPA Fallback)

If your app uses **client-side routing** (e.g., React Router, Vue Router), you have two options. Without one of them, refreshing the page on a non-root URL will return a GitHub 404, because GitHub Pages serves static files and does not understand SPA routes.

### Option A: Use `HashRouter` (Simplest)

`HashRouter` places the route after a `#` (e.g., `https://example.com/#/about`). The server only ever sees the root path, so refreshes and direct links always work without any server-side configuration. This is the simplest solution for static hosts like GitHub Pages.

```tsx
import { HashRouter } from 'react-router-dom'

<HashRouter>
  <App />
</HashRouter>
```

The trade-off is that URLs contain `#`, which is slightly less clean but perfectly functional.

### Option B: Use `BrowserRouter` with `basename` and a `404.html` Fallback

If you want clean URLs (without `#`), you need two things:

1. **`basename` on your router** so it knows about the repository subpath.
2. **A `404.html` file** that mirrors `index.html`, so GitHub Pages serves your SPA shell for unknown paths instead of its own 404 page.

For React Router:

```tsx
import { BrowserRouter } from 'react-router-dom'

<BrowserRouter basename={import.meta.env.BASE_URL}>
  <App />
</BrowserRouter>
```

`import.meta.env.BASE_URL` will automatically be `/<your-repo-name>/` in production and `/` in development, so the same code works in both environments.

For the fallback, create a `404.html` in your `public/` directory with the same content as your `index.html` (or simply copy `index.html` to `404.html` after building). A common approach is to add a small script in `404.html` that redirects to `index.html` while preserving the path, but even a plain copy is enough to serve the SPA shell.

> **Vue users:** Vue Router supports `createWebHistory` with a `base` argument. Pass `import.meta.env.BASE_URL` there, and use the same `404.html` strategy if you want clean URLs.

---

## Step 3: Create the GitHub Actions Workflow

Create a file at `.github/workflows/deploy.yml`. The workflow below builds your app with pnpm and deploys the `dist` folder to the `gh-pages` branch using `peaceiris/actions-gh-pages`.

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

### Key points about this workflow

- **`permissions: contents: write`** is essential. Without it, the `GITHUB_TOKEN` cannot push to the `gh-pages` branch, and the deploy step fails with a Git error (`exit code 128` or `403`).
- **pnpm must be set up before Node** so that `cache: 'pnpm'` works correctly.
- **`--frozen-lockfile`** ensures the CI build uses the exact dependency versions from `pnpm-lock.yaml`.
- **`peaceiris/actions-gh-pages@v4`** creates and pushes to the `gh-pages` branch automatically. It does not require you to manually create the branch.

---

## Step 4: Configure GitHub Pages Source

After the first successful workflow run, configure GitHub Pages to serve from the branch the action created:

1. Go to your repository **Settings → Pages**.
2. Under **Build and deployment → Source**, select **"Deploy from a branch"**.
3. Choose the **`gh-pages`** branch and the **`/ (root)`** folder.
4. Save.

GitHub will publish your site at `https://<username>.github.io/<repo-name>/`.

> Some workflows use the official `actions/deploy-pages` action instead, which requires setting the source to **"GitHub Actions"**. The `peaceiris` approach above uses the branch-based source (`gh-pages`), which is simpler and works reliably for Vite projects.

---

## 🔧 Troubleshooting Common Errors

### ❌ Assets return 404 (`/assets/index-abc.js` not found)

**Cause:** Vite's `base` is still `/` instead of `/<repo-name>/`.
**Fix:** Set `base: '/<repo-name>/'` in `vite.config.ts` and rebuild.

### ❌ Workflow fails with `exit code 128` or `403 Permission denied`

**Cause:** The `GITHUB_TOKEN` does not have write permission.
**Fix:** Add `permissions: contents: write` to the workflow file (as shown above), **or** go to **Settings → Actions → General → Workflow permissions** and select **"Read and write permissions"**.

### ❌ Refreshing a subpage returns GitHub's 404 page

**Cause:** No SPA fallback is configured.
**Fix:** Use `HashRouter`, or add `basename` to `BrowserRouter` and provide a `404.html` that mirrors `index.html`.

### ❌ Blank page with no visible errors

**Cause:** Often the same `base` issue, or assets are being requested from the wrong origin. Open the browser DevTools **Network** tab and check the requested URLs. If they start with `/assets/` instead of `/<repo-name>/assets/`, revisit Step 1.

### ❌ Icons or images from `public/` do not load

Files in `public/` are copied to the root of `dist`. When `base` is set correctly, Vite automatically handles the prefix for assets referenced in code, but **hard-coded paths** in CSS or HTML (e.g., `url('/logo.png')`) will still break. Use relative paths or reference `import.meta.env.BASE_URL` when constructing URLs.

---

## ✅ Verifying the Deployment

After the workflow completes:

1. Open `https://<username>.github.io/<repo-name>/`. The app should load without 404s in the console.
2. Open `https://<username>.github.io/<repo-name>/assets/<some-built-file>.js` directly. It should return the file content, not a 404.
3. Navigate to a subpage and refresh. If you configured routing correctly, the page should reload without a GitHub 404.

---

## 📌 Quick Checklist

- [ ] `base: '/<repo-name>/'` in `vite.config.ts`
- [ ] `basename={import.meta.env.BASE_URL}` on `BrowserRouter` (or use `HashRouter`)
- [ ] `404.html` fallback in `public/` (if using `BrowserRouter`)
- [ ] Workflow includes `permissions: contents: write`
- [ ] GitHub Pages source set to the `gh-pages` branch
- [ ] pnpm version in the workflow matches your local version

With these pieces in place, every push to your default branch will automatically build and deploy your Vite app to GitHub Pages—no manual steps required.
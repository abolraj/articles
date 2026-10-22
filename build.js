#!/usr/bin/env node
/**
 * build.js — scans articles/<folder>/<lang>.md, reads front matter per
 * language, auto-detects (per-language or shared) hero images, and writes
 * articles.json at the repo root.
 *
 * Layout:
 *   my-blog/
 *   ├── index.html
 *   ├── build.js
 *   ├── articles.json                ← generated
 *   └── articles/
 *       ├── hello-world/
 *       │   ├── en.md
 *       │   ├── fa.md
 *       │   ├── hero.jpg              ← shared hero
 *       │   ├── hero.fa.jpg           ← FA-only hero
 *       │   └── diagram.png
 *       └── another-post/
 *           ├── en.md
 *           └── hero.fa.jpg
 *
 * Front-matter keys (case-insensitive, per-language file):
 *   title, date, excerpt, dir, tags, draft, default
 *   hero, heroAlt, heroCaption
 *
 *   default: true       → this language is the article's default
 *   hero: none          → force-disable hero for this language
 *   hero: custom.jpg    → explicit hero file inside the folder
 *   (omitted)           → auto-detect  hero.<lang>.<ext>  →  hero.<ext>
 *
 * Legacy folders containing only index.md are warned about; rename to
 * en.md (or your language) to migrate.
 */
const fs   = require('fs');
const path = require('path');

const DIR = __dirname;
const OUT = path.join(DIR, 'articles.json');

const ARTICLES_BASE = 'articles';                       // ← article folders live here
const ARTICLE_ROOT  = path.join(DIR, ARTICLES_BASE);

const HERO_BASES = ['hero', 'cover', 'banner', 'thumb', 'thumbnail'];
const HERO_EXTS  = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];
const LANG_FILE  = /^([a-z]{2,3}(?:-[a-z0-9]{2,8})*)\.md$/i;
const RTL_LANGS  = new Set(['ar','arc','ckb','dv','fa','ha','he','khw','ks',
                            'prs','ps','sam','sd','ug','ur','yi']);

const isRTL = lang => RTL_LANGS.has(lang.split('-')[0].toLowerCase());

/* ---------- front matter ---------- */
function parseFrontMatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(src);
  if (!m) return { data: {}, body: src };

  const data = {};
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i < 0) continue;
    const key = line.slice(0, i).trim().toLowerCase();
    let val = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (key === 'tags') val = val.replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean);
    if (key === 'draft' || key === 'default') val = /^(true|yes|1|on)$/i.test(val);
    data[key] = val;
  }
  return { data, body: src.slice(m[0].length) };
}

/* ---------- markdown → plain text (excerpts) ---------- */
function plain(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------- hero ---------- */
function resolveHero(folderAbs, folderName, fm, lang) {
  // explicit front-matter value wins
  if (fm.hero !== undefined) {
    const v = String(fm.hero).trim();
    if (/^(none|false|no|off|0|-)$/i.test(v)) return null;
    const abs = path.join(folderAbs, v);
    if (fs.existsSync(abs)) return path.posix.join(folderName, v.split(path.sep).join('/'));
    console.warn(`   ⚠  hero "${v}" not found in ${folderName}/ — skipping`);
    return null;
  }
  // per-language auto: hero.fa.jpg, cover.fa.png …
  for (const base of HERO_BASES)
    for (const ext of HERO_EXTS) {
      const name = `${base}.${lang}${ext}`;
      if (fs.existsSync(path.join(folderAbs, name)))
        return path.posix.join(folderName, name);
    }
  // shared auto: hero.jpg, cover.png …
  for (const base of HERO_BASES)
    for (const ext of HERO_EXTS) {
      const name = base + ext;
      if (fs.existsSync(path.join(folderAbs, name)))
        return path.posix.join(folderName, name);
    }
  return null;
}

/* ---------- language files in a folder ---------- */
function listLanguageFiles(folderAbs) {
  return fs.readdirSync(folderAbs)
    .map(f => {
      const m = LANG_FILE.exec(f);
      return m ? { file: f, lang: m[1].toLowerCase() } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.lang.localeCompare(b.lang));
}

/* ---------- scan ---------- */
const articles = [];

if (!fs.existsSync(ARTICLE_ROOT)) {
  console.error(`✗ "${ARTICLES_BASE}/" not found next to build.js`);
  process.exit(1);
}

for (const ent of fs.readdirSync(ARTICLE_ROOT, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  if (ent.name.startsWith('.') || ent.name === 'node_modules') continue;

  const folderAbs = path.join(ARTICLE_ROOT, ent.name);
  const langFiles = listLanguageFiles(folderAbs);

  if (!langFiles.length) {
    if (fs.existsSync(path.join(folderAbs, 'index.md')))
      console.warn(`   ⚠  ${ARTICLES_BASE}/${ent.name}/index.md — rename to a language file (e.g. en.md)`);
    continue;
  }

  const perLang = {};
  for (const { file, lang } of langFiles) {
    const src = fs.readFileSync(path.join(folderAbs, file), 'utf8');
    const { data: fm, body: rawBody } = parseFrontMatter(src);
    if (fm.draft === true) continue;

    const body = rawBody.replace(/^\s*#\s+[^\n]*\r?\n?/, '').trim();
    const firstPara = plain(body).split(/\n{2,}/)[0] || '';
    const excerpt = fm.excerpt
      || (firstPara.length > 160 ? firstPara.slice(0, 157).trimEnd() + '…' : firstPara);

    perLang[lang] = {
      title:       fm.title || ent.name.replace(/[-_]/g, ' '),
      excerpt,
      dir:         fm.dir || (isRTL(lang) ? 'rtl' : 'ltr'),
      date:        fm.date || null,
      hero:        resolveHero(folderAbs, ent.name, fm, lang),
      heroAlt:     fm.heroalt     || null,
      heroCaption: fm.herocaption || null,
      _isDefault:  fm.default === true,
    };
  }

  const available = Object.keys(perLang).sort();
  if (!available.length) continue;

  let defaultLang = available.find(l => perLang[l]._isDefault);
  if (!defaultLang && perLang.en) defaultLang = 'en';
  if (!defaultLang) defaultLang = available[0];

  const langs = available.slice().sort((a, b) =>
    a === defaultLang ? -1 : b === defaultLang ? 1 : a.localeCompare(b));

  const date = perLang[defaultLang].date
    || Object.values(perLang).map(m => m.date).find(Boolean)
    || null;

  const meta = {};
  for (const lang of langs) {
    const { _isDefault, ...rest } = perLang[lang];
    meta[lang] = rest;
  }

  articles.push({
    slug:        ent.name,
    dir:         ent.name,
    date,
    defaultLang,
    langs,
    meta,
  });
}

articles.sort((a, b) =>
  (b.date || '').localeCompare(a.date || '')
  || a.meta[a.defaultLang].title.localeCompare(b.meta[b.defaultLang].title));

fs.writeFileSync(OUT, JSON.stringify(articles, null, 2) + '\n');

console.log(`✓ articles.json — ${articles.length} article(s)`);
for (const a of articles) {
  const t = a.meta[a.defaultLang].title;
  console.log(`   ${a.langs.join(', ').padEnd(12)} ${a.slug.padEnd(20)} ${a.date || '(no date)'}  ${t}`);
}
console.log('\nServe the folder over HTTP, e.g.  python3 -m http.server 8000');
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Dev server with live reload (http://localhost:8080)
- `npm run build` - Build to `_site/`
- `npm run fetch-episodes` - Fetch RSS, cache to `_cache/episodes.json`, scaffold new episode dirs
- `npm run test:perf` - Playwright perf test (WebKit)

**Important**: Never run `serve` or `dev` — the developer is already running `npm run dev`. Use `npm run build` to check the build.

## Overview

Eleventy 3 static site for the Neomania podcast (neomania.net). ESM-only (`import`/`export`, never `require`). Plain CSS and vanilla JS — no bundler, no preprocessor.

```
.eleventy.js               # Config: episodes collection, filters, icon shortcode, slug generation
src/_data/
├── episodes.js            # fetchEpisodes() RSS logic (default export is an unused empty array)
├── episodeAnnotations.js  # Manual per-episode overrides, keyed by slug
├── platformLinks.json     # Spotify/Apple URLs, keyed by episode number
└── meta.js                # Build timestamp, used as ?v= cache-buster on scripts
src/_layouts/              # base.njk, episode.njk
src/_includes/components/  # hero, episode-catalog, nav, theme-toggle, debug-panel, ...
src/_includes/icons/       # SVGs for the {% icon "name" %} shortcode
src/episodes/NN/index.md   # One file per episode; drives the collection, permalink /ep/NN/
scripts/                   # fetch-episodes, platform-link fetchers, catalog export
css/, js/, images/         # Passthrough-copied as-is
```

## Episode Data Flow

1. `npm run fetch-episodes` pulls the RSS feed, caches it, and writes `src/episodes/NN/index.md` (frontmatter + Turndown-converted notes) **only for episodes that don't already have one** — existing files are never overwritten, so hand edits are safe.
2. At build, the `episodes` collection in `.eleventy.js` reads those markdown files (not the cache), generates a slug from the title, and merges in `episodeAnnotations.js` (`_defaults` + per-slug overrides: `customTitle`, `expandedNotes`, `customSlug`, `guestDisplayName`, `guestPreposition`, `tags`, etc.) and `platformLinks.json`.
3. Platform links are refreshed separately via `scripts/fetch-apple-episodes.mjs` and `scripts/extract-platform-links.mjs`.

**Duplication to keep in sync:** `generateSlug()` exists in both `.eleventy.js` and `src/_data/episodes.js`, and the annotation merge exists in both `.eleventy.js` and `episodeAnnotations.merge()` (used by scripts). Change them together.

## Templates

- Nunjucks only; filters with args use parentheses: `{{ title | truncate(200) }}` (never Liquid `truncate: 200`)
- Episodes: `{% for post in collections.episodes %}` → fields on `post.data`
- Custom filters: `formatDuration` ("HH:MM:SS" → "XHr Ymin"), `padStart`, `date` (supports `"MM/dd/yy"`)

## Frontend

- Home page (`src/index.html`): fixed hero with animated wordmark that FLIPs into the nav on scroll, episode catalog scrolls up underneath; WebGL grain overlay (`js/grain-shader.js`); episode hover drives the background (`js/background-controller.js`); light/dark theme in `js/main.js`.
- Scripts are loaded explicitly in `src/_layouts/base.njk` — a new JS file does nothing until added there.
- DOM code must check elements exist before using them (`if (el) { ... }`).

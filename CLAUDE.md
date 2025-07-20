# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with live reload (opens http://localhost:8080)
- `npm run build` - Build site for production to `_site/` directory  
- `npm run serve` - Serve built site without watching for changes
- `npm run fetch-episodes` - Fetch episode data from RSS feed and cache to `_cache/`

**Important**: For debugging, never run `serve` - the developer is already running `npm run dev`. Use `build` to test if the build works.

## Architecture Overview

This is an **Eleventy static site** for a podcast called Neomania. The site uses a **two-phase data pipeline**:

1. **Data Fetching** (manual): `npm run fetch-episodes` calls `fetchEpisodes()` from `src/_data/episodes.js` to pull RSS data and cache it
2. **Site Building** (automatic): Eleventy reads cached data and merges it with episode annotations during build

### Key Architecture Patterns

- **ESM-only codebase**: All JS files use `import`/`export` syntax (never `require`/`module.exports`)
- **Data layer separation**: Complex logic lives in `src/_data/*.js`, templates stay simple
- **Episode enhancement**: RSS data gets merged with manual annotations from `episodeAnnotations.js`
- **Collection-based episodes**: Episodes are generated from markdown files in `src/episodes/*/index.md`

## Critical File Structure

```
src/_data/
├── episodes.js          # RSS fetching logic + empty default export
├── episodeAnnotations.js # Manual episode enhancements/corrections
└── meta.js             # Site metadata

src/episodes/XX/
└── index.md            # Episode content files (drive the collections)

.eleventy.js            # Main config with collections, filters, and slug generation
```

## Eleventy-Specific Rules

### Collections
Episodes are built via the `episodes` collection in `.eleventy.js`, which:
- Reads from `src/episodes/*/index.md` files
- Generates slugs automatically via `generateSlug()`
- Merges data with `episodeAnnotations.js` enhancements
- Adds computed fields like `hasCustomContent`, `hasTranscript`

### Data Access in Templates
- ESM default exports are accessed via `.default` in Nunjucks templates
- Example: `{% for episode in episodes.default %}` (if using default export)
- Collections are accessed directly: `{% for episode in collections.episodes %}`

### Nunjucks Syntax
- Filters with arguments use parentheses: `{{ title | truncate(200) }}` 
- Never use Liquid syntax: `{{ title | truncate: 200 }}` ❌

## Frontend Architecture

### Component Structure
- Reusable components go in `src/_includes/components/`
- Use `{% include "components/component-name.njk" %}` to render
- Main layouts in `src/_includes/_layouts/`

### JavaScript Guidelines
- All DOM manipulation must check element existence first:
  ```javascript
  const element = document.querySelector('.selector');
  if (element) {
    element.addEventListener('click', handler);
  }
  ```
- Client-side JS files are in `/js/` and get copied via passthrough

### Styling
- CSS files in `/css/` get copied via passthrough copy
- No preprocessor - plain CSS with modern features

## Data Pipeline Details

### Episode Data Flow
1. `npm run fetch-episodes` → `fetchEpisodes()` → writes to `_cache/episodes.json`
2. Build time → `.eleventy.js` reads episode markdown files
3. Collection processing merges cached RSS data with annotations
4. Result: Enhanced episode objects with all metadata

### Episode Annotations System
`episodeAnnotations.js` provides:
- `_defaults` - Applied to all episodes
- Per-episode overrides by slug key
- Custom titles, expanded notes, transcripts, guest links, corrections
- Computed flags like `hasCustomContent`

## Common Patterns

### Adding New Episodes
1. RSS provides basic data via `npm run fetch-episodes`
2. Create `src/episodes/XX/index.md` with frontmatter
3. Add enhancements to `episodeAnnotations.js` if needed
4. Slugs auto-generate from titles

### Custom Filters Available
- `formatDuration` - Converts "HH:MM:SS" to "XHr Ymin"
- `padStart` - String padding (like JS padStart)
- `date` - Date formatting including "MM/dd/yy"

### Icon System
Use `{% icon "icon-name" %}` shortcode to inline SVGs from `src/_includes/icons/`
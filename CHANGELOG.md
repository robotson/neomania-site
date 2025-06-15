# Neomania Site Changelog

All notable changes to the Neomania podcast website will be documented in this file.

## [Unreleased]

## [2025-06-14]

### Added

- **Content-Driven Architecture**: Implemented a robust data pipeline that converts RSS feed items into local Markdown files (`/src/episodes/`), which now serve as the canonical source for all episode content.
- **Episode Scaffolding Script**: Created a non-destructive script (`npm run fetch-episodes`) to automatically generate new episode Markdown files from the feed without overwriting existing, manually edited content.
- **Annotation System**: Developed a sophisticated annotation layer (`episodeAnnotations.js`) to enrich episodes with structured metadata like tags, featured status, and custom slugs for cleaner URLs.
- **Individual Episode Pages**: Added layouts and routing to generate unique pages for each episode (e.g., `/ep/7-stochastic-funnerism-and-autonomous-media/`).
- **Smart Caching System**: Implemented intelligent caching with different refresh intervals for development (5min), production (1hr), and CI environments (always fresh).
- **HTML-to-Markdown Conversion**: Added `turndown` library integration to convert RSS HTML content into clean Markdown for better content management.

### Changed

- **RSS Integration Architecture**: Transitioned the site from being data-driven (reading from a live-fetched JSON object) to content-driven (building from a collection of local Markdown files).
- **Modernized to ES Modules**: Updated the entire project configuration, including `.eleventy.js` and all scripts, to use modern ES Module syntax (`import`/`export`).
- **Episode URL Structure**: Updated episode slugs to include episode numbers in both titles and URLs (e.g., `/ep/7-stochastic-funnerism-and-autonomous-media/`).
- **Fixed CSS Overflow Issue**: Scoped global overflow styles to landing page only using `:has(#noise-canvas)` selector to prevent scrolling issues on content pages.
- **Major Architecture Refactoring**: Extracted monolithic index.html into modular components
  - Moved all inline CSS to dedicated `css/landing.css` file (12KB+ of styles)
  - Extracted all JavaScript functionality to `js/main.js` (365 lines of code)
  - Updated base layout template with comprehensive head tags and asset linking
  - Transformed index.html into clean content-only file using Eleventy front matter
  - Restructured about page to use unified layout system with content-pane wrapper
  - Streamlined style.css to focus only on content page styling
  - Updated Eleventy configuration to handle new asset directories
  - Preserved all existing functionality: theme toggle, font animations, canvas background, platform icons, email protection
  - Improved maintainability and scalability for future Figma design implementation
  - Enhanced performance with proper asset caching and separation of concerns

## [2025-03-28]

### Added

- Background noise effect with adaptive density:
  - Implemented a static noise background with consistent dot density across all screen sizes
  - Added density-consistent approach that scales based on viewport dimensions
  - Optimized for performance on large screens with scaling
  - Added respect for reduced-motion preferences
- Improved letter animation:
  - Implemented balanced animation for logo letters to prevent readability issues
  - Added parameter correlation to maintain letter legibility
  - Made animation speed adjustable and visually engaging
  - Added protection against extreme font variations

## [2025-03-21]

### Added

- Official podcast platform icons:
  - Downloaded and integrated official SVG/PNG icons for all platforms
  - Created theme-specific variants (dark/light mode) for each platform
  - Added clipboard copy functionality for RSS feed URL
- Comprehensive CHANGELOG.md documenting site development (235ca0b)

### Changed

- Reorganized platform links:
  - Made Apple Podcasts the first platform option
  - Improved alignment and spacing of all platform icons
  - Enhanced visual consistency across platforms
  - Made platform icons properly center-aligned
- Refined UI for better visual hierarchy:
  - Added subtle typographic divider between sections
  - Made Twitter and Contact links more understated with text-only styling
  - Adjusted spacing for better content rhythm and balance
  - Removed glow effect from bottom links
  - Improved container layout to prevent shifting elements

### Removed

- Overcast platform option as it's niche
- Decorative borders around platform icons
- Button styling from Twitter and Contact links

## [2025-03-16]

### Added

- Theme support with light and dark mode styles (93f5741)

## [2025-03-10]

### Added

- Image passthrough copy and enhanced meta tags for SEO (bc33693)
- Responsive design and email protection feature with toast notification (699031b)

## [2025-03-09]

### Added

- About page and updated navigation (44694ef)
- Initial Eleventy site structure and configuration (cfc2d39)
- Initial commit of the project (b9d5e9e)

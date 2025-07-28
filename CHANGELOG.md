# Neomania Site Changelog

All notable changes to the Neomania podcast website will be documented in this file.

## [Unreleased] - v2.0.0

### [2025-07-28] - Animated Background System & Episode Hover States

#### Added

- **Viewport-Fixed Background System**: Implemented scrolling background texture with shimmer grain overlay that reveals behind hero section as user scrolls down.
- **Animated Background Texture**: Added `neomania-bg-texture.png` as crawling horizontal background (400s animation cycle) with viewport-fixed positioning.
- **Dynamic Grain Shimmer Overlay**: Created animated SVG turbulence filter with 10s seed animation cycle, fine grain (`baseFrequency="1.5"`), and `color-burn` blend mode for visible distortion effects.
- **Smart Scroll-Triggered Visibility**: Implemented `background-controller.js` to show/hide background layers based on scroll position with smooth opacity transitions.
- **Episode Hover States**: Added Figma-compliant hover effects for episode rows with semi-transparent background highlighting and smooth transitions.
- **Overscroll Protection**: Added solid background layer (`z-index: -101`) to prevent background texture visibility during browser rubber-banding.

#### Enhanced

- **Episode Link Interactivity**: Fixed z-index conflicts that were blocking episode row interactions by adjusting hero container layering.
- **Background Layer Architecture**: Established three-layer system (solid background, texture, grain) with proper z-index management (-101, -100, -99).
- **Visual Polish**: Removed bottom border from last episode in list for cleaner visual termination.

#### Fixed

- **Interaction Blocking**: Resolved issue where `fixed-hero-container` with `z-index: 100` was preventing episode link clicks and hover states.
- **Background Transparency**: Made main content areas transparent to allow viewport background layers to show through properly.

#### Technical Implementation

- **CSS Layer Stack**: `z-index: -101` (solid), `-100` (texture), `-99` (grain), `0-2` (content)
- **Performance**: GPU-accelerated animations with `transform: translateZ(0)` and `will-change` properties
- **Accessibility**: Full `prefers-reduced-motion` support for all background animations
- **Theme Integration**: Background layers work with existing light/dark theme system

### [2025-07-15 to 2025-07-27] - V2 Design Implementation Progress

#### Added

- **Enhanced Scroll Animation System**: Implemented GPU-accelerated scroll animations with Safari compatibility and cross-browser optimization for smooth 60fps performance.
- **FLIP Animation Framework**: Added sophisticated FLIP (First, Last, Invert, Play) animation scaling and positioning system for fluid UI transitions.
- **Responsive Navigation Enhancements**: Improved mobile header layout with extra headspace and adaptive breakpoint handling.
- **Advanced CSS Variable System**: Updated landing page with refined CSS custom properties for better design token management.

#### Enhanced

- **Performance Optimizations**: Applied micro-optimizations to scroll animations, reducing jank and improving overall site responsiveness.
- **Cross-Browser Compatibility**: Enhanced Safari-specific scroll animation handling and responsive navigation behavior.
- **Episode List Refinements**: Added typography overrides and XL breakpoint spacing adjustments for improved visual hierarchy.
- **Landing Page Polish**: Fine-tuned scroll behavior and visual feedback for better user experience.

#### In Progress - V2 Vision

- **Scrolling Background Animation**: Major background animation system for immersive visual experience (not yet implemented).
- **Shimmer Disturbance Layer**: Interactive visual effect layer that creates dynamic shimmer effects (planned).
- **Complete Navigation System**: Additional menu components and interactions per Figma designs (in development).
- **Figma Episode Pages**: Full implementation of episode page layouts matching design specifications (upcoming).

#### Notes

This release represents significant progress toward the V2 design vision with a focus on performance, animations, and responsive behavior. The core landing page experience is largely functional, with major visual features still in development.

## [Released] - v1.0.0

### [2024-07-15] - Comprehensive Refinements

#### Added

- **Breakpoint-Specific Typography Specs**: Implemented detailed typography settings for S, M, L, and XL breakpoints, including font families (Roboto Flex for titles/subtitles, Space Mono for metadata), precise font sizes, weights, line-heights, letter-spacing, and styles.
- **Grid Layout Fine-Tuning**: Added column spanning for elements like dates (span 2 columns) and guest names (span 5 columns) in S breakpoint; ensured consistent gutters, margins, and padding across breakpoints (e.g., 50px margin for M, 14px gutter).
- **Vertical Spacing Controls**: Introduced custom padding for rows (e.g., 15px top/18px bottom for L, 19px for XL) and gaps between title/subtitle (5px for XL).
- **Variable Font Enhancements**: Refined font-variation-settings for XL titles (weight 500) and subtitles (weight 300 with slant -10).
- **Color Token Alignment**: Added Figma-aligned tokens like --text-level-1 (#F4F4F4) and ensured usage in titles/subtitles; metadata uses --text-level2 (#EDEDED).

#### Enhanced

- **Responsive Adjustments**: Fine-tuned line-heights (e.g., 19.6px for S titles/subtitles), letter-spacing (e.g., 0.91px for XL metadata, 0.77px for S/M/LG metadata), and paddings (e.g., reduced S gap to 13px between subtitle and metadata).
- **Grid Stability**: Prevented column stretching by using auto/max-content for dates and spanning multiple columns where needed.
- **Documentation**: Expanded episode-list-typography.md with new columns for weights, line-heights, styles, and detailed refinement notes for each breakpoint.

#### Fixed

- **Layout Issues**: Resolved column expansion problems for dates by switching to spanning (e.g., 4/6 for M/L/XL); corrected excessive spacings (e.g., reduced S top padding to 10px, gap to 13px).
- **Typography Consistency**: Removed unwanted italic/slant from S subtitles; reverted and fine-tuned line-heights multiple times for optimal readability (final 19.6px for S).
- **Redundancies**: Omitted duplicate properties in CSS implementations to keep code clean while matching Figma specs.

### [2025-06-30]

#### Added

- **Full Design Spec Implementation**: Began a comprehensive refactor of the episode list component (`episode-catalog.njk`) and its styles (`episode-list.css`) to better match the detailed responsive design specification. This includes precise, multi-breakpoint grid layouts (24, 16, and 8-column), complex content reflowing for stacked mobile views, and correct typography sizing. More work is needed to add vertical rhythm and other design details.

#### Enhanced

- **Component Architecture**: The `episode-catalog.njk` component now uses a flat HTML structure, making it fully compatible with CSS `subgrid` for robust and maintainable layouts. All data display logic (e.g., guest name variations, title overrides) is handled cleanly within this single component.

#### Fixed

- **Episode Page Layout**: The dedicated `/episodes` page has been corrected to use the canonical `episode-catalog.njk` component, eliminating layout bugs and ensuring 100% visual consistency with the homepage's episode list.

### [2025-06-29] - Addendum

### [2025-06-23]

#### Added

- **Advanced Scroll-Driven Hero Animation**: Attempted a sophisticated "splash → pinned" animation system with smooth interpolation over viewport height, transforming static hero into dynamic scroll-responsive experience. This is a work in progress and needs more work to be fully functional.
- **Variable Font Animation System**: Updated the complex font variation animation which features 13 different axes (weight, width, optical size, grade, slant, XOPQ, XTRA, YOPQ, YTAS, YTDE, YTFI, YTLC, YTUC) including balanced relationships and legibility protection.
- **Fixed Hero Container Architecture**: Introduced fixed positioning system with dedicated scroll container for animation transitions without layout shift.
- **One-Way Animation Logic**: Implemented progress-only-increases system preventing animation reversal during scroll, creating intentional directional user experience.
- **Comprehensive Letter Animation States**: Each letter maintains individual animation states with randomized speeds, directions, and settling behaviors for organic visual movement.
- **Cross-Browser Scroll Animation**: Used scroll event listeners for maximum compatibility while maintaining smooth 60fps performance across all browsers.
- **Main Content Fade System**: Added opacity animation for main content that reveals over the first 10% of scroll progress, creating smooth content transition.
- **Advanced Performance Optimization**: Animation frame cleanup and scroll listener removal upon completion to prevent memory leaks and improve performance.

#### Enhanced

- **Responsive Wordmark Sizing**: Dynamic font size interpolation from initial clamp-based sizing to final 2.2rem with smooth scaling.
- **Hero Container Morphing**: Smooth height transition from full viewport (100vh) to compact header (6.25rem) with background color transitions.
- **Typography Animation**: Dynamic text shadow reduction and letter-spacing adjustments as wordmark transitions to sticky state.
- **Accessibility Support**: Comprehensive reduced motion support with static fallback states that respect user preferences.

#### Fixed

- **Scroll Animation Performance**: Refined scroll handling logic to ensure progress only increases, creating one-way animation effect and removing scroll event listeners once animation completes for enhanced performance.

### [2025-06-29]

#### Added

- **Master Grid System**: Implemented unified CSS Grid architecture for episode list, replacing conflicting Grid/Flexbox layouts with consistent, mobile-first system across all breakpoints.
- **Granular Content Override System**: Introduced flexible annotation system in `episodeAnnotations.js` for manual override of episode data including guest names, titles, and prepositions (`guestPreposition`, `guestDisplayName`, `guestShortName`, `displayTitleOverride`).
- **Developer Dashboard**: Transformed `test-annotations.html` into comprehensive developer tool for managing annotations, debugging merged data, and quick slug reference with copy-paste templates.
- **XL Breakpoint Typography**: Enhanced typography system with specific font size overrides for extra-large screens (1920px+) - 20px for titles/descriptions, 13px for metadata elements.
- **Conditional Guest Styling**: Implemented `.no-guest` class system for episodes without guest information, enabling cleaner CSS targeting and layout control.
- **Waterfall Data Logic**: Added sophisticated data merging logic that prefers override data but gracefully falls back to RSS defaults.

#### Enhanced

- **Data Processing Architecture**: Centralized all episode data processing (slug generation, annotation merging) into Eleventy collections for single source of truth.
- **Responsive Grid Precision**: Achieved pixel-perfect alignment across all breakpoints (XS: 8-column, S: 16-column, M/L/XL: 24-column) with proper subgrid implementation.
- **Typography Hierarchy**: Improved visual hierarchy with size-specific typography rules that enhance readability and maintain design consistency.
- **Template Flexibility**: Updated `episode-catalog.njk` with conditional logic for guest information display and title override handling.

#### Fixed

- **Layout Stability**: Resolved numerous layout bugs caused by conflicting CSS methodologies by implementing unified Master Grid system.
- **Cross-Breakpoint Consistency**: Eliminated fluid layout issues between breakpoints, creating predictable "snap-to-width" behavior.
- **Guest Information Display**: Fixed conditional display of guest information with proper preposition handling and name variations.

### [2025-06-15]

#### Added

- **Responsive Episode List Component**: Implemented multi-breakpoint episode list that adapts to LG, M, S, and XS screen sizes with complex CSS Grid layout matching Figma specifications.
- **Custom Eleventy Filters**: Added specialized filters for date formatting (`MM/dd/yy`) and duration formatting (`XHr Ymin`) to enhance data presentation.
- **Design System Integration**: Integrated new design system tokens (colors, fonts) into the theme for consistent visual styling.

#### Changed

- **Episode List UI**: Transformed episode listing from basic layout to sophisticated responsive component with live data integration and professional visual design.

#### [2025-06-15] Addendum

#### Added

- **Numbered Episode Structure**: Migrated from slug-based episode files to numbered directory structure (`src/episodes/01/`, `src/episodes/07/`, etc.) for better organization and cleaner URLs (`/ep/01/`, `/ep/07/`).
- **Supplemental Content System**: Episodes can now include co-located supplemental files (`transcript.md`, `expanded-notes.md`, `guest-links.md`, `corrections.md`, `media/`) with automatic detection and display.
- **Custom Episodes Collection**: Implemented explicit Eleventy collection (`src/episodes/*/index.md`) to ensure proper episode discovery and sorting by episode number.
- **Enhanced Episode Templates**: Added conditional supplemental content sections using `<details>` elements that automatically appear when additional content is available.
- **Supplemental Content Flags**: Extended episode frontmatter with boolean flags (`hasTranscript`, `hasExpandedNotes`, `hasGuestLinks`, etc.) to track available supplemental content.
- **Episode Management Scripts**: Enhanced scaffolding script to create numbered directories, detect supplemental content, and set appropriate frontmatter flags automatically.

#### Changed

- **Episode URL Structure**: Simplified episode URLs from `/ep/long-episode-title-slug/` to clean numbered format `/ep/07/` using episode number as primary organizational key.
- **Episode Discovery**: Episodes now use episode number rather than filename for organization, making it immediately clear which episode is which in the file system.
- **Permalink Generation**: Updated permalink structure to use `{{ episodeNumber | padStart(2, '0') }}` for consistent two-digit formatting.
- **Content Co-location**: All episode-related content (transcripts, notes, media) now lives alongside the main episode file for better organization.

#### Enhanced

- **Developer Experience**: Episode management is now much more intuitive with numbered directories and co-located supplemental content.
- **Scalability**: Structure works seamlessly whether you have 10 or 100+ episodes, with clear migration path for future season/year-based organization.
- **Content Workflow**: Adding supplemental content is now as simple as dropping files in the episode directory and updating frontmatter flags.

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

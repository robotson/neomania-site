# Neomania Site Changelog

All notable changes to the Neomania podcast website will be documented in this file.

## [Unreleased]

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

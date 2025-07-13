# **Episode List Typography — Breakpoint Reference**

| Breakpoint | Title Font Size | Metadata Font Size | Row Vertical Padding | Title Letter Spacing | Metadata Letter Spacing | Subtitle Weight | Subtitle Line Height | Subtitle Letter Spacing | Metadata Weight | Title Weight | Title Line Height | Subtitle Style |
| ---------- | :-------------: | :----------------: | :------------------: | :------------------: | :---------------------: | :-------------: | :------------------: | :---------------------: | :-------------: | :----------: | :---------------: | :------------: |
| **XL**     |       20px      |        13px        |        19px          |        0.60px        |         0.91px          |      300*       |        1.5*          |        0.60px*          |      400*       |     500*     |       1.5*        |     normal*    |
| **LG**     |       16px      |        11px        |        16px*         |       0.39px*        |         0.77px          |      300        |        22px          |        0.48px           |      400        |     600*     |       1.5*        |     normal*    |
| **M**      |       14px      |        11px        |        16px*         |       0.42px         |         0.77px          |      300        |        20px          |        0.42px           |      400        |     600      |       20px        |     normal     |
| **S**      |     13.9px      |        11px        |        12px*         |       0.42px         |         0.77px          |      300        |      19.6px          |        0.42px           |      400        |     600      |     19.6px        |     normal     |
| **XS**     |       13px      |        10px        |        12px*         |       0.39px*        |         0.70px*         |      300*       |        1.5*          |        0.39px*          |      400*       |     600*     |       1.5*        |     normal*    |

*_Default values inherited from base styles_

---

### **Definitions**

* **Title:** Main episode title text
* **Metadata:** All meta info (date, guest name, episode number, duration, etc.)
* **Row Vertical Padding:** Top and bottom padding for each episode row
* **Title Letter Spacing:** Character spacing for title text
* **Metadata Letter Spacing:** Character spacing for episode numbers, dates, durations, etc.
* **Subtitle Weight:** Font weight for subtitle text
* **Subtitle Line Height:** Line height for subtitle text
* **Subtitle Letter Spacing:** Letter spacing for subtitle text
* **Metadata Weight:** Font weight for metadata text
* **Title Weight:** Font weight for title text
* **Title Line Height:** Line height for title text
* **Subtitle Style:** Font style for subtitle text (normal, italic)

---

### **Notes**

* "Metadata" includes: episode number, guest name, date, duration, "w/" label, etc.
* Font sizes *decrease smoothly* as breakpoints get smaller for legibility and space.
* XL breakpoint gets increased vertical padding (19px) for more generous spacing on large screens.
  * **XL/LG/S/M Typography Refinements:**
    - **Titles:** Lighter weight (500 vs default 600) via `font-variation-settings: "wght" 500`
    - **Subtitles (S):** Roboto Flex, 13.9px, normal, weight 300, line-height 19.6px (141.007%), letter-spacing 0.42px
    - **Subtitles (LG):** Weight 300, line-height 22px (137.5%), letter-spacing 0.48px
    - **Subtitles (XL):** Light weight + slant via `font-variation-settings: "wght" 300, "slnt" -10`
    - **Titles (S):** Roboto Flex, 13.9px, normal, weight 600, line-height 19.6px (141.007%), letter-spacing 0.42px
    - **Titles (M):** Roboto Flex, 14px, normal, weight 600, line-height 20px (142.857%), letter-spacing 0.42px
    - **Subtitles (M):** Roboto Flex, 14px, normal, weight 300, line-height 20px (142.857%), letter-spacing 0.42px
    - **Metadata (S/LG/M):** Space Mono, 11px, normal style, weight 400, normal line-height, letter-spacing 0.77px, uppercase
    - **Title Letter Spacing:** Increased to 0.60px for better readability at 20px size
  - **Metadata Letter Spacing:** Increased to 0.91px for enhanced legibility at 13px
  - **Title-Subtitle Gap:** 5px margin-bottom on titles for clean separation
  - **Color Tokens:** Uses `--text-level-1` (Figma-aligned) for consistent theming
* You can reference this directly in your design tokens, CSS variables, or Tailwind config.

--- 
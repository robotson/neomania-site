# **Neomania Site Responsive Grid & Layout Spec**

*Last updated: June 29, 2025*

---

## **Breakpoints & Grid Settings**

| Name | Width × Height | Columns | Margin (L/R) | Gutter | Grid Mode | Snap or Fluid | Notes                                                      |
| ---- | -------------- | ------- | ------------ | ------ | --------- | ------------- | ---------------------------------------------------------- |
| XL   | 1920 × 1085    | 24      | 60px         | 16px   | Stretch   | Snap/fixed    | Desktop, always locked to 1920px                           |
| LG   | 1280 × 836     | 24      | 50px         | 16px   | Stretch   | Snap/fixed    | Desktop, always locked to 1280px                           |
| M    | 1024 × 774     | 24      | 50px         | 14px   | Stretch   | Fluid         | Grid and content scale/fluidly down to S                   |
| S    | 768 × 551      | 16      | 50px         | 14px   | Stretch   | Snap/fixed    | Tablet/narrow desktop, locked to 768px                     |
| XS   | 393 × 856      | 8       | 22px\*       | 14px   | Stretch   | Snap/fixed    | Mobile, locked to 393px; \*margin may be imperfect in code |

---

## **Grid Behavior**

* **XL/LG/XS:** Layout "snaps" to a fixed width—no fluid scaling. Design is centered in window; extra space outside margins shows background.
* **M–S (1024px→768px):** Grid is fully responsive/flexible; columns, gutters, and content stretch to fill window between 1024px and 768px.
* **S & XS:** Layout hits hard stops at 768px and 393px respectively, reflows as needed.

---

## **Content Layouts By Breakpoint**

### **XL, LG, M**

* **Episode List (Row):**

  * Col 1: Episode number
  * Col 4: Date
  * Col 7–21: Title & subtitle (title/subtitle may span up to col 21)
  * Col 24 (right-aligned): Duration
* **Header:**

  * "Catalog": Col 1
  * "Listen" (dropdown): Col 4
  * "neomania" logo: centered
  * "Connect": Col 21
  * **Reduce motion icon:** right of col 23
  * **Dark mode icon:** right of col 24

---

### **S (768px, 16 col)**

* **Episode List (Stacked Row):**

  * **First row:**

    * Col 1: Episode number
    * Col 3–16: Title (single line, ellipsis; "w/ Guest" removed from title and split out below)
  * **Second row:**

    * Col 3–16: Subtitle (max two lines)
  * **Fixed space**
  * **Third row:**

    * Col 1: Stylized "W/" (if guest present)
    * Col 3: Guest name
    * Col 13: Date
    * Col 16 (right-aligned): Duration
* **Header/Menu:**

  * "neomania": centered
  * **Reduce motion icon:** right of col 15
  * **Dark/light mode icon:** right of col 16
  * **More menu (three dots):** centered above logo; clicking opens overlay with all menu items, visually centered

---

### **XS (393px, 8 col)**

* **Episode List (Stacked Mobile):**

  * **First row:**

    * Col 1: Episode number
    * Col 2–8: Title (single line, ellipsis; "w/ Guest" split out)
  * **Second row:**

    * Col 2–8: Subtitle (max two lines)
  * **Fixed space**
  * **Third row:**

    * Col 1: "W/"
    * Col 2: Guest name
    * Col 4: Date
    * Col 8 (right-aligned): Duration
* **Header/Menu:**

  * "neomania": centered at top
  * **More menu (three dots):** centered above/near logo
  * **All icons/options** (reduce motion, dark/light mode): **only visible in More menu overlay**—not inline in header

---

## **Practical Notes & Behaviors**

* **Grid mode:** Always "stretch"
* **Column counts:**

  * 24 (XL/LG/M),
  * 16 (S),
  * 8 (XS)
* **Snap/fixed at breakpoints:**

  * 1920px, 1280px, 768px, 393px
  * Fluid between 1024px and 768px only (M–S)
* **Episode list content:**

  * XL/LG/M: multi-col, full row mapping
  * S/XS: stacked, modular rows, "w/ Guest" split below title, titles/subtitles ellipsize to max two lines
* **Header menu:**

  * XL/LG/M: Full menu, all icons inline
  * S: "More" menu appears, some icons remain inline
  * XS: All menu/icons in overlay

---

## **Design Decisions**

* **S and XS layouts** are more vertical/stacked for clarity and touch targets
* **Ellipsis/line limits**: Titles and subtitles never exceed two lines at S and XS
* **Overlay menu** (S, XS): All options centered; menu expands/collapses; future details tbd

---

## **To-Do/Future Details**

* **S/XS overlay menu content & animation** (to be finalized)
* **Verify code margin rendering at XS (22px may differ on actual devices)**
* **Refine typographic vertical space values for stacked episode rows**

---

## **Visual/Code Reference:**

*(Consider sharing this doc with both design & frontend devs for single source of truth!)*

--- 
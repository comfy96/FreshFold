# Information Design: Head Configuration, Body Architecture & Typography Responsiveness

- **Project:** FreshFold Laundry
- **Task:** Task Two — Step 10: Information Design & Layout Refinement
- **Author:** Comfort Igboko
- **Date:** 3 November 2026

---

## Part 1: The Browser Head

Configuration belongs in the `<head>` to control how the application announces itself to search engines, browsers, and social preview crawlers.

### 1. Dynamic Title That Changes with Navigation
Rather than a static, hardcoded title string, we implemented Next.js's metadata template pattern in [app/layout.tsx](file:///Users/comfortigbokoalexis/Desktop/FreshFold/app/layout.tsx):
```typescript
title: {
  default: "Fresh Fold Laundry — Digital Receipt Book",
  template: "%s — Fresh Fold Laundry",
}
```
* **Home Route (`/`):** `<title>Fresh Fold Laundry — Digital Receipt Book</title>`
* **Intake Enquiry Route (`/enquiry`):** `<title>Customer Laundry Intake — Fresh Fold Laundry</title>`
* **Database Inspector Route (`/admin/database-inspector`):** `<title>Table Inspector — Fresh Fold Laundry</title>`

### 2. Short Tagline (<10 Words)
* **Tagline:** *"Your verified laundry records at a glance."* (7 words).
* **Rationale:** Communicates the specific customer utility immediately without marketing hyperbole.

### 3. SEO Tags (Marketing Page Only)
```html
<meta name="robots" content="index, follow" />
<meta name="keywords" content="laundry Nigeria, clothes pickup, digital receipt book, wash and iron, order tracking" />
```
* **Rationale:** Ensures search discoverability for neighbourhood pickup inquiries while keeping private customer query routes non-indexed.

### 4. Custom Favicon
Created [app/icon.svg](file:///Users/comfortigbokoalexis/Desktop/FreshFold/app/icon.svg) featuring the brand primary terracotta background (`#d04b17`, Tone 50) and a crisp laundry-fold geometric mark. Served dynamically at `/icon.svg`.

### 5. Open Graph Meta Tags
```html
<meta property="og:title" content="Fresh Fold Laundry — Digital Receipt Book" />
<meta property="og:description" content="Your verified laundry records at a glance." />
<meta property="og:url" content="https://freshfold.ng" />
<meta property="og:site_name" content="Fresh Fold Laundry" />
<meta property="og:locale" content="en_NG" />
<meta property="og:type" content="website" />
```
* **Verification:** Validated via `curl` extraction on live route.

---

## Part 2: The Body (Screen Information Architecture)

### 1. Removing Redundancy: Adjacent Logo Label
* **What was removed:** A text span reading "Fresh Fold" placed immediately next to the primary SVG brand logo.
* **Why:** The visual SVG mark already communicates the brand. Having an identical adjacent text label created redirection confusion (users were unsure whether clicking the text did something different than clicking the icon) and cluttered the visual hierarchy on mobile viewports.

### 2. Collapsing Unnecessary Choices: The Single Action Gate
* **The Problem:** Many laundry apps force visitors to choose between "Track Orders" and "Request Pickup" on the home screen. For a customer like Amaka Obi whose signal is weak, deciding between two buttons before knowing what the system holds creates decision friction.
* **The Solution:** We collapsed this choice into **one primary action button**: `Record Laundry Pickup`. Secondary exploration is handled via a discreet text link (`View Database Records`). This directs user attention into a single funnel.

### 3. Heading Wrap Constraint: Balanced Shape vs. Awkward Orphans
* **Unconstrained Failure (Bad Wrap):** On wide viewports without a max-width, the headline stretches across the screen and leaves a single dangling word on line 2 (*"plain."*), pulling visual weight unevenly.
* **Constrained Resolution (Good Wrap):** Constrained with `max-width: 20ch` and `text-wrap: balance`:
  ```css
  max-width: 20ch;
  text-wrap: balance;
  ```
  Forces the headline into a deliberate two-line shape:
  > **Verified laundry records,**  
  > **dated and plain.**

### 4. Button Sizing in `rem` Units & Border Radius
* **Button Sizing:** `padding: 0.75rem 1.75rem;` (12px vertical, 28px horizontal).
* **Corner Radius:** `border-radius: var(--freshfold-radius-full);` (pill shape).
* **Why `rem` instead of fixed pixels:** Sizing in `rem` respects the user's root browser font size settings. If a low-vision user scales their default device text to 20px, `rem`-sized buttons expand proportionally to contain the text, whereas fixed pixel buttons (`height: 48px`) cause text clipping and overflow.

### 5. Task 1 Label Typography Applied to Buttons
Every button consumes the exact token properties compiled from Task 1:
```css
font-family: var(--freshfold-type-label-large-font-family);
font-size: var(--freshfold-type-label-large-font-size);
font-weight: var(--freshfold-type-label-large-font-weight);
letter-spacing: var(--freshfold-type-label-large-letter-spacing);
```

---

## Part 3: Interaction & Responsiveness

### 1. Cursor & Hover Feedback
* All interactive links and buttons have explicit `cursor: pointer`.
* Hover states trigger a subtle elevation lift (`transform: translateY(-1px)`) and shadow depth transition (`var(--freshfold-shadow-medium-shadow)`).
* The brand logo explicitly links back to `/`.

### 2. Fluid Typography with CSS `clamp()`
Fixed large headers (`font-size: 57px`) overflow on 320px mobile viewports (e.g., cheap Android devices). We replaced fixed sizing with fluid clamp scaling:
```css
font-size: clamp(1.75rem, 4vw + 1rem, 2.625rem);
```
* **At 360px viewport (Mobile):** Renders at `28px` (1.75rem) — perfectly fitted without horizontal scroll.
* **At 768px viewport (Tablet):** Renders at `33.7px` (fluid transition).
* **At 1200px+ viewport (Desktop):** Caps at `42px` (2.625rem) — bold and balanced.

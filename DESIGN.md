---
name: LendLoop
description: A neighborhood tool-lending board built as a shared pegboard shadow wall.
colors:
  paper: "#f4f1ea"
  ink: "#1b1b1b"
  hardboard: "#c9a270"
  hardboard-hole: "#9e7a4d"
  kraft: "#e8d2a6"
  kraft-edge: "#9e7a4d"
  safety: "#f4c20d"
  safety-pressed: "#e2b300"
  tag-red: "#d7262e"
  card: "#fbf9f4"
  dust: "#e9e3d6"
  muted-ink: "#5c5548"
  border: "#d9d1c1"
  input-stroke: "#b9ae98"
  destructive: "#b4161e"
  rail-hover: "#2e2c28"
  rail-border: "#34322d"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "6rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.01em"
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.025em"
rounded:
  tag-hole: "3px"
  sm: "0.3rem"
  md: "0.4rem"
  lg: "0.5rem"
  xl: "0.7rem"
  2xl: "0.9rem"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-accent:
    backgroundColor: "{colors.safety}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-accent-hover:
    backgroundColor: "{colors.safety-pressed}"
  button-accent-lg:
    backgroundColor: "{colors.safety}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "48px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.dust}"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
  hang-tag-home:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "28px"
    padding: "2px 12px 2px 20px"
  hang-tag-out:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.safety}"
    typography: "{typography.label}"
    height: "28px"
  hang-tag-pending:
    backgroundColor: "{colors.safety}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "28px"
  hang-tag-overdue:
    backgroundColor: "{colors.tag-red}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    height: "28px"
  hang-tag-yours:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "28px"
  hang-tag-done:
    backgroundColor: "{colors.dust}"
    textColor: "{colors.muted-ink}"
    typography: "{typography.label}"
    height: "28px"
  tool-tile:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "12px"
  tool-tile-out:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "12px"
  tool-glyph-home:
    backgroundColor: "{colors.dust}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "112px"
  tool-glyph-out:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.safety}"
    rounded: "{rounded.md}"
    height: "112px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "40px"
  nav-item:
    textColor: "{colors.dust}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.safety}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  trusted-mark:
    backgroundColor: "{colors.safety}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 6px"
  count-badge:
    backgroundColor: "{colors.tag-red}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "0 8px"
---

# Design System: LendLoop

## Overview

**Creative North Star: "The Shadow Board"**

LendLoop is a workshop pegboard shared by a street. Every listed tool hangs on a hardboard wall as a pinned card; when a tool goes out on loan, the card loses its lift and becomes a dashed outline, and its icon turns into a dashed safety-yellow stroke on ink, the painted silhouette left behind on a real shadow board. Status lives on kraft hang tags, not grey pills. The world is built from four shop materials (paper, ink, hardboard, kraft) and two signal colors (safety yellow, tag red), and nothing else.

Density is calm and practical: one body size, generous 40px+ controls, four tiles across at desktop, one column of horizontal tiles on phones. Titles and tool names shout in condensed uppercase like stencilled labels; everything else speaks in plain Barlow. The interface is light-only by decision (dark mode deferred), so the shadcn `dark:` classes still present in `components/ui` are inert.

The system rejects the neutral marketplace card grid with grey status pills. Pegboard texture belongs only behind tool walls (the wall, the public wall, the auth pages' backdrop), never as general decoration.

**Key Characteristics:**
- Paper ground, ink rail, hardboard pegboard behind tool walls only.
- Safety yellow is a fill with ink text, used for the primary action, the active nav item, pending tags and the Trusted mark.
- Tag red is reserved for overdue status and unread counts.
- Home vs. out is shown by form (lifted solid card vs. dashed outline, solid vs. dashed icon stroke), never by color alone.
- Kraft hang tags with a punched hole carry every status word.
- Barlow Condensed uppercase for titles and tool names; Barlow for everything else.

## Colors

A warm workshop palette: off-white paper and near-black ink carry the structure; hardboard and kraft add material; safety yellow and tag red are the only signals.

### Primary
- **Safety Yellow** (safety): the fill for the one primary action per view ("Hang a tool", "Approve", "Request" submit), the active rail item, the wordmark, pending hang tags, the Trusted mark, out-of-loan glyph strokes, and text selection. Always paired with ink text, or used as a stroke/text on ink. Hover darkens to Safety Pressed.

### Secondary
- **Tag Red** (tag-red): overdue hang tags and the incoming-request count on the rail (and the dot on the mobile menu button). White text on it.

### Neutral
- **Paper** (paper): page background, primary-button text on ink, outline-button fill.
- **Ink** (ink): all body text, the left rail and mobile header, the landing page's "How it works" band, the default (ink) button, pin dots on tiles, out-of-loan glyph panels, focus outlines.
- **Card White** (card): tool tiles, loan rows, dialogs and popovers; a hair lighter than paper so cards read as pinned sheets.
- **Hardboard** (hardboard) with **Hardboard Hole** (hardboard-hole): the pegboard surface and its 24px hole grid; the hole tone also colors the scrollbar thumb.
- **Kraft** (kraft) with **Kraft Edge** (kraft-edge): the default "On the wall" hang tag and its stroke.
- **Dust** (dust): secondary/muted fill: home glyph panels, request notes, closed-status tags, rail text color.
- **Muted Ink** (muted-ink): secondary text (category and condition lines, descriptions, counts).
- **Border** (border) and **Input Stroke** (input-stroke): card and outline-button borders; form-field and chip strokes.
- **Destructive** (destructive): remove/decline text actions and validation messages, used as a tint (10% fill) rather than a solid button.
- **Rail Hover** (rail-hover) and **Rail Border** (rail-border): hover fill and edges inside the ink rail and mobile sheet.

### Named Rules
**The Fill-Not-Text Rule.** Safety yellow is a background with ink text or a stroke on ink. It is never text on paper.

**The Two Signals Rule.** Only safety yellow and tag red signal. Yellow means "act / pending / trusted"; red means "late / waiting count". No other hue enters the UI.

**The Pegboard Is a Wall Rule.** The pegboard utility appears only behind collections of tools (wall, public wall) and as the auth-page backdrop. Lists, forms and admin tables sit on plain paper.

## Typography

**Display Font:** Barlow Condensed 600/700 (via next/font, `--font-condensed`), used through the `font-title` utility: weight 700, uppercase, 0.01em tracking, line-height 1.05.
**Body Font:** Barlow 400/500/600/700 (via next/font, `--font-barlow`).

**Character:** Stencilled shop labels over a plain, friendly sans. Condensed uppercase gives tool names the weight of a label on a drawer; Barlow keeps everything else easy to read.

### Hierarchy
- **Display** (Condensed 700, 3.75rem / 4.5rem sm / 6rem lg): the landing hero headline only.
- **Headline** (Condensed 700, 2.25rem / 3rem sm): page titles in the page header; "How it works" on landing in safety yellow on ink.
- **Title** (Condensed 700, 1.25rem mobile / 1.5rem sm for tile tool names; 1.5rem section headings and loan-row names; 1.875rem dialog titles and landing step titles).
- **Body** (Barlow 400, 1rem, line-height 1.5): all running text, page-header count lines, empty-state copy. Landing lede is 1.125rem.
- **Meta** (Barlow 400, 0.875rem): category · condition lines, owner lines, descriptions on tiles, date sublines, table text.
- **Label** (Barlow 700, 0.75rem, 0.025em tracking, uppercase, tabular numerals): hang tags. The Trusted mark and count badge use the same size and weight without uppercase.
- **Controls** (Barlow 600, 0.9375rem buttons; 1rem large buttons; 0.875rem chips; 1rem rail items).

### Named Rules
**The Condensed Means Name Rule.** Barlow Condensed uppercase is for titles and tool names only. Never set body copy, buttons or form labels in it.

**The Tabular Dates Rule.** Dates, counts and day lengths use tabular numerals (`tabular` utility) so rows line up.

## Layout

The app shell is a two-column grid at lg (1024px): a sticky 16rem ink rail on the left (wordmark, nav, user card pinned to the bottom) and a paper content column capped at 80rem with 16px gutters (32px from sm) and 32px top padding (40px at lg). Below lg the rail collapses into a sticky 56px ink header with the wordmark, user button and a menu button that opens the same nav in a left sheet.

Pages open with a page header: condensed title and a muted count line at left, the primary action at right (stacked on mobile). The tool wall follows with a single row of category chips (horizontally scrolling and bleeding to the screen edge on mobile, wrapping at sm), then the pegboard: a 0.9rem-radius hardboard panel with 16px padding (24px from sm, extra top padding so tile pins clear the edge) and a 20px grid gap; 1 column, 2 at sm (640px), 4 at xl (1280px). Tiles are horizontal (48px glyph left, text right) on phones and vertical cards from sm.

Loan lists (Requests, Incoming, Listings) are stacked rows under condensed section headings with a muted count, sections 40px apart. Rows stack on mobile and split into identity left, dates + tag right at md (768px). The landing page uses a 1.05fr / 1fr hero at lg with a 3-column public wall, then a full-bleed ink band.

Spacing rhythm is Tailwind's 4px grid; the reused steps are 4, 8, 12, 16, 24 and 32px.

## Elevation & Depth

Mostly flat, with one physical metaphor: tool cards hang on the pegboard. A home tool card carries a soft warm drop shadow and a small ink pin dot at top center with its own tiny shadow; an out tool card drops the shadow and becomes a dashed ink outline on translucent paper, so the board shows through. The 500ms ease-out transition between the two states is the system's signature motion. Everywhere else (loan rows, dialogs, chips) depth comes from the card-vs-paper tone shift, 1px borders and a 10% ink ring on dialogs, not shadows.

### Shadow Vocabulary
- **Hanging card** (`box-shadow: 0 2px 6px rgb(60 40 10 / 0.18)`): home tool tiles and public-wall tiles on the pegboard, and the empty-wall note card.
- **Pin** (`box-shadow: 0 1px 1px rgb(0 0 0 / 0.4)`): the ink pin dot on app tool tiles.

### Named Rules
**The Lift Means Home Rule.** A shadow on a tool card means the tool is on the wall. Out tools lose the shadow and gain a dashed outline. Do not add shadows to anything that is not hanging on the pegboard.

## Shapes

Gently rounded throughout from a 0.5rem base radius: buttons, inputs and select triggers at 0.5rem; glyph panels and nav items at 0.4rem; tiles, loan rows, dialogs and empty states at 0.7rem; the pegboard panel at 0.9rem. Chips and count badges are full pills. The hang tag is the one asymmetric shape: a near-square 3px left edge with a punched paper-colored hole, and a 0.7rem rounded right end. Dashed strokes are a deliberate device meaning "absent": out-of-loan tile borders (2px dashed), out-of-loan icon strokes (dash 3 3), empty-state borders and empty-state icons.

## Components

### Buttons
Solid, compact, confident.
- **Shape:** gently rounded (0.5rem), 40px tall default, 48px large, 15px semibold label; press nudges down 1px.
- **Accent (primary):** safety yellow with ink text; hovers to Safety Pressed. One per view for the main act ("Hang a tool", "Approve", dialog submits, landing CTA).
- **Ink (default):** ink fill with paper text, 85% ink on hover. Used for the per-tile "Request to borrow".
- **Outline:** paper fill, 1px border, dust on hover. Secondary actions: Manage, View request, Cancel, Decline, Mark returned.
- **Ghost / destructive text:** ghost buttons in destructive red with a 10% red hover tint for Remove.
- **Focus:** 3px ring at 50% ink plus the global 2px ink outline offset 2px; in the rail the outline is safety yellow.

### Chips
- **Style:** category filter pills, 36px tall, 16px side padding, 14px semibold, card fill with Input Stroke border; hover darkens the border to ink.
- **State:** the selected chip inverts to ink fill with paper text (`aria-pressed`).

### Cards / Containers
- **Tool tile:** card white, 0.7rem radius, 12px padding, 2px border (transparent when home, dashed 70% ink when out), hanging-card shadow when home, ink pin dot. Contents: glyph panel, condensed name (2 lines max), meta lines, owner + Trusted mark, hang tag, full-width action.
- **Loan row:** card white with 1px border, 16px padding; closed loans (returned, declined, cancelled) go transparent. Borrower notes sit in a dust panel with a quote icon.
- **Dialog:** card white, 0.7rem radius, 10% ink ring, condensed 1.875rem title.

### Inputs / Fields
- **Style:** transparent fill, 1px Input Stroke border, 0.5rem radius; form fields in dialogs are set to 40px tall.
- **Focus:** border turns ink with a 3px 50% ink ring.
- **Error / Disabled:** destructive border and 20% destructive ring; disabled at 50% opacity.

### Navigation
- **Rail:** ink background, 44px items with an 18px icon and 16px semibold label in dust; hover fills Rail Hover with paper text; the active item is a safety-yellow fill with ink text (`aria-current="page"`). Incoming shows a tag-red pill count when requests wait. Mobile: 56px ink header and a left sheet with the same items; a tag-red dot on the menu button signals waiting requests.

### Hang Tag (signature)
A kraft-style tag, 28px tall, 12px bold uppercase tabular text, with a 6px paper-colored punched hole on the left. Variants map to loan state: **home** kraft with kraft-edge stroke ("On the wall"); **out** ink with safety text ("Out · back Nov 17"); **pending** safety with ink stroke ("Request sent", "Needs your answer"); **overdue** tag red with white text; **yours** card white with ink stroke; **done** dust with muted text (returned, declined, cancelled). Every status word appears as text, so state never depends on color alone.

### Tool Glyph (signature)
The category or name-matched icon on a panel: 112px tall full-width panel (80px on the public wall) or a 48px square on phones and in loan rows. Home: ink stroke (1.75) on dust. Out: dashed safety stroke (1.6, dash 3 3) on ink, the painted outline. Icons come from Lucide plus two authored SVGs (ladder, saw) matched by tool name in `lib/labels.ts`.

### Trusted Mark
Safety-yellow chip, 0.3rem radius, 12px bold ink text with a 14px badge-check icon, placed after the owner's name.

### Empty State
Dashed Input Stroke border, 0.7rem radius, centered dashed 40px icon in muted ink, condensed 1.5rem title, short body and an optional accent button.

## Do's and Don'ts

### Do:
- **Do** use safety yellow as a fill with ink text, one accent button per view.
- **Do** show a tool's state by form first: lifted solid card for home, dashed outline and dashed safety-on-ink icon for out.
- **Do** put every status word on a hang tag with the matching variant.
- **Do** set titles and tool names with the `font-title` utility (Barlow Condensed 700 uppercase).
- **Do** keep the pegboard behind tool collections and auth backdrops only.
- **Do** use tabular numerals for dates and counts.
- **Do** keep form fields and buttons at least 40px tall.

### Don't:
- **Don't** ship grey status pills or a neutral marketplace card grid; status goes on hang tags.
- **Don't** use tag red for anything except overdue status and waiting counts.
- **Don't** set safety yellow as text on paper.
- **Don't** add shadows to anything that is not hanging on the pegboard.
- **Don't** introduce new hues beyond the paper, ink, hardboard, kraft, safety and tag-red family.
- **Don't** add dark-mode styles until the dark theme is designed; the product is light-only.

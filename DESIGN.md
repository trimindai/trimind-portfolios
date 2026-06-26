---
name: Portfolio Pro
description: Arabic-first CV/portfolio builder for Kuwait & Gulf professionals
# Homepage system (2026-06): Arabic-first ink/paper/green/gold palette replaces
# the prior "Quiet Atelier" emerald. Tokens live in tailwind.config.ts (ink/paper/
# green/gold) and globals.css (--ink-*/--paper/--green-*/--gold; --land-* remap onto them).
colors:
  ink: "#0D1117"
  ink-80: "#1C2333"
  ink-50: "#4A5568"
  ink-30: "#8B9BAD"
  ink-10: "#EFF2F6"
  paper: "#FAFBFC"
  green: "#1B7A4E"
  green-mid: "#22A063"
  green-bright: "#2DC072"
  green-glow: "rgba(34,160,99,0.15)"
  gold: "#C8862A"
  gold-light: "#F5D48A"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(3rem, 5vw + 1rem, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.03em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.atelier-emerald}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.emerald-hover}"
    textColor: "#ffffff"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.soft-text}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  card-surface:
    backgroundColor: "#0f172a80"
    textColor: "{colors.soft-text}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  chip-accent:
    backgroundColor: "{colors.emerald-tint}"
    textColor: "{colors.emerald-hover}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Design System: Portfolio Pro

## 1. Overview

**Creative North Star: "The Quiet Atelier"**

A designer's private workshop: precise, unhurried, expert. Dark surfaces recede so the work (portfolio templates) stands forward. Emerald accents are deliberate and rare, marking only the actions that matter. The tool never competes with what it produces.

Portfolio Pro's visual language serves GCC professionals who expect polish without pretension. The interface says "we've already made the design decisions" through craft, not decoration. Every surface is dark enough to let template previews and content breathe, but warm enough (slate, not pure black) to avoid the cold-tool cliche. The emerald accent carries the brand's "go" energy without overwhelming.

This system explicitly rejects: AI-generated aesthetics (gradient blobs, glassmorphism, hero-metric templates), cheap page-builder clutter (Wix-style sidebars, inconsistent spacing, clip-art), and generic SaaS cream (warm beige, soft illustrations, rounded-everything).

**Key Characteristics:**
- Dark workshop surfaces with tinted slate neutrals, never pure black
- Single emerald accent used with restraint; its rarity is the point
- Geist typeface throughout, hierarchy driven by scale and weight, not decoration
- Flat elevation with border-based separation; no shadows
- Content-forward: template previews, portfolio data, and user work always dominate the visual hierarchy
- Bilingual-native: Arabic RTL is a first-class layout, not a mirror

## 2. Colors: The Atelier Palette

A restrained palette: tinted dark neutrals form the workshop, and a single emerald accent marks intention. The darkness is warm (blue-tinted slate, not gray), and the emerald is earned, not scattered.

### Primary
- **Atelier Emerald** (#059669 / oklch(0.596 0.145 163)): The single accent. CTAs, active states, progress indicators, success confirmations. It says "go" without shouting.

### Neutral
- **Deep Ink** (#020617 / oklch(0.129 0.014 256)): Page background. The darkest surface, blue-tinted. Never used for text.
- **Workshop Dark** (#0f172a / oklch(0.208 0.018 265)): Secondary background. Card fills, section backgrounds, nav bar base.
- **Surface Recessed** (#1e293b / oklch(0.282 0.018 260)): Tertiary surface. Hover states, step indicators (pending), input backgrounds.
- **Frame Line** (#334155 / oklch(0.371 0.013 261)): Borders, dividers, button outlines. The structural skeleton.
- **Whisper Text** (#64748b / oklch(0.554 0.019 254)): De-emphasized labels, timestamps, footnotes.
- **Quiet Text** (#94a3b8 / oklch(0.685 0.019 250)): Secondary body copy, descriptions, subtitles.
- **Soft Text** (#cbd5e1 / oklch(0.835 0.013 253)): Primary body copy on dark backgrounds.
- **Clean White** (#f8fafc / oklch(0.98 0.002 247)): Headlines, primary labels, high-emphasis text. Never pure #fff.

### Named Rules
**The One Accent Rule.** Atelier Emerald appears on no more than 10% of any screen. Its power comes from scarcity. If a screen feels emerald-heavy, remove instances until only the primary action and success states remain.

**The Tinted Neutral Rule.** Every neutral carries a blue undertone (chroma 0.013-0.019 in the 250-265 hue range). Pure gray (#808080, oklch with chroma 0) is forbidden. The warmth is subtle but structural.

## 3. Typography

**Display Font:** Geist (with system-ui, sans-serif fallback)
**Body Font:** Geist (with system-ui, sans-serif fallback)

**Character:** A single typeface family creates unity across the entire product. Geist is technical enough for an engineering audience, warm enough for creative professionals, and clean enough for corporate users. Hierarchy is achieved entirely through scale, weight, and tracking, never through font-family switching.

### Hierarchy
- **Display** (700, clamp(3rem, 5vw + 1rem, 4.5rem), line-height 1.1, tracking -0.02em): Hero headlines only. One per page maximum. The landing page hero title.
- **Headline** (700, clamp(1.875rem, 3vw, 2.25rem), line-height 1.2, tracking -0.01em): Section titles. "Everything You Need", "Simple Pricing", template names.
- **Title** (600, 1.25rem, line-height 1.3): Card titles, step names, dialog headers. The workhorse heading.
- **Body** (400, 1.125rem, line-height 1.6): Descriptions, feature text, FAQ answers. Max line length: 65ch.
- **Label** (500, 0.875rem, line-height 1.4): Button text, form labels, nav items, status badges.
- **Caption** (400, 0.75rem, line-height 1.5, tracking 0.03em): Timestamps, help text, fine print. Used sparingly.

### Named Rules
**The Weight Ladder Rule.** Adjacent hierarchy levels must differ by at least one weight step (100) AND one size step (ratio >= 1.25). Display-to-Headline and Headline-to-Title must feel like genuine steps, not gradual drift.

**The Single Family Rule.** Geist only. No decorative fonts, no serif pairings, no monospace for emphasis. If something needs emphasis, use weight or size, not a different typeface.

## 4. Elevation

Portfolio Pro is flat by default. Depth is conveyed through background tint layering (Deep Ink > Workshop Dark > Surface Recessed) and borders (Frame Line), never through shadows. The only depth effect is the navbar's `backdrop-blur` (12px), which anchors it above scrolling content.

This is intentional: a flat system lets the portfolio template previews (which have their own elevation systems) stand forward without competing with the app chrome.

### Named Rules
**The No Shadow Rule.** No `box-shadow` on any app surface. If something needs to feel elevated, use a lighter background tint. Shadows are reserved for the portfolio templates themselves, not the builder UI.

**The Blur Exception.** `backdrop-blur` is permitted only on the fixed navbar (to maintain readability over scrolling content) and on overlay/modal backdrops. Nowhere else.

## 5. Components

### Buttons
Buttons are the primary interactive element. They feel solid and decisive.

- **Shape:** Gently curved (8px radius)
- **Primary:** Atelier Emerald background, white text, 10px 16px padding. The only emerald-filled element on most screens.
- **Hover:** Shifts to Emerald Hover (#10b981), slightly brighter. `transition-colors` at 150ms default.
- **Focus:** Ring outline using --ring token. 2px offset.
- **Ghost/Secondary:** Transparent background, Frame Line border, Soft Text color. Hover fills to Surface Recessed.
- **Disabled:** 30% opacity. No color change.

### Chips / Tags
Used for template feature tags ("PDF Export", "Arabic + English") and status badges.

- **Style:** Full-round (9999px radius), Emerald Tint background (emerald at 10% opacity), Emerald Hover text color.
- **Size:** Caption-scale text (0.75rem), 4px 12px padding.
- **Status variant:** Published (emerald tint), Paid (amber tint), Draft (slate tint). Color indicates state; paired with text label, never color alone.

### Cards / Containers
Content containers for portfolios, template previews, and form sections.

- **Corner Style:** Slightly rounded (12px radius)
- **Background:** Workshop Dark at 50% opacity (`#0f172a80`)
- **Border:** 1px Frame Line (never thicker, never colored)
- **Internal Padding:** 20-24px
- **No shadow.** Depth from border + background tint only.

### Inputs / Fields
Form fields in the builder wizard.

- **Style:** Surface Recessed background, Frame Line border, 8px radius
- **Focus:** Border shifts to Atelier Emerald. No glow, no shadow.
- **Error:** Destructive red border (oklch(0.577 0.245 27)), label turns red.
- **Disabled:** 50% opacity, no interaction.

### Navigation
- **Fixed top bar:** Deep Ink at 80% opacity + backdrop-blur. Frame Line bottom border.
- **Brand mark:** Left-aligned, Title weight (600), Clean White.
- **Nav items:** Label scale, Quiet Text color. Hover shifts to Clean White. Active item: Atelier Emerald text.
- **Mobile:** Collapsible, same color rules.

### Step Indicator (Signature Component)
The builder wizard's progress tracker. Horizontal pill chain connected by lines.

- **Active step:** Atelier Emerald fill, white text, number inside circle.
- **Completed step:** Emerald Tint fill, emerald text, checkmark replaces number.
- **Pending step:** Surface Recessed fill, Whisper Text, number shown.
- **Connector lines:** 1px, emerald (completed) or Frame Line (pending). 32px wide.

## 6. Do's and Don'ts

### Do:
- **Do** use Atelier Emerald exclusively for primary actions and success states. One accent, used with conviction.
- **Do** tint every neutral toward slate-blue. Even the faintest chroma (0.005) prevents the interface from feeling dead.
- **Do** let template previews dominate the visual hierarchy. The builder UI is a frame, not the painting.
- **Do** treat Arabic RTL as a native layout. Test every component in both directions. Text alignment, icon placement, and reading flow must feel intentional in Arabic.
- **Do** use borders (1px, Frame Line color) as the primary separation mechanism. Borders are honest and predictable.
- **Do** keep motion to `transition-colors` and `transition-opacity`. State changes should feel immediate and confident.

### Don't:
- **Don't** use gradient blobs, glassmorphism cards, or the hero-metric template (big number + small label + gradient accent). These are the AI-generated aesthetic Portfolio Pro explicitly rejects.
- **Don't** use box-shadow on app surfaces. The no-shadow doctrine keeps the flat workshop aesthetic intact.
- **Don't** scatter emerald across the interface. If more than 10% of a screen is emerald, remove instances until only the most important action remains.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe. Rewrite with full borders, background tints, or nothing.
- **Don't** use identical card grids (same-size cards with icon + heading + text repeated). Vary card content, size, or structure.
- **Don't** use pure black (#000) or pure white (#fff). Every extreme must carry the slate-blue tint.
- **Don't** introduce a second font family. No serif pairings, no monospace for decoration, no display fonts for headings.
- **Don't** build layouts that look like Wix or generic WordPress themes: cluttered sidebars, inconsistent spacing, "built with" badges, clip-art icons. Portfolio Pro is the antidote to cheap page builders.
- **Don't** use warm beige backgrounds, soft illustrations, or rounded-everything. That's generic SaaS cream, not a professional career tool.

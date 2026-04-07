# Design Brief

## Direction

**부동산 가격 추이 (Property Price Tracker)** — Data-driven dark dashboard for Korean real estate market surveillance with instant trend comprehension.

## Tone

Minimalist professional with strategic color accents; every element serves data clarity and pattern recognition over decoration.

## Differentiation

Regional comparison cards with embedded sparkline charts and semantic color tinting (green for rising markets, neutral for stable) enable instant market pattern recognition without leaving the dashboard.

## Color Palette

| Token      | OKLCH        | Role                          |
| ---------- | ------------ | ----------------------------- |
| background | 0.125 0 0    | Dark charcoal primary surface |
| foreground | 0.93 0 0     | Text on dark backgrounds      |
| card       | 0.16 0 0     | Elevated card surfaces        |
| primary    | 0.75 0.18 240 | Data highlights, CTAs         |
| accent     | 0.72 0.22 140 | Interactive elements          |
| chart-1    | 0.78 0.3 120 | Price increase (green)        |
| chart-2    | 0.68 0.28 25 | Price decrease (red)          |

## Typography

- Display: Bricolage Grotesque — confident headers, regional titles, data labels
- Body: DM Sans — body text, descriptions, input labels, metadata
- Scale: h1 `text-3xl font-display font-700`, h2 `text-xl font-display font-600`, label `text-sm font-body font-500`, body `text-base font-body font-400`

## Elevation & Depth

Multi-layer card stacking with subtle borders; primary content on `bg-card`, supporting content on `bg-muted/40`, elevated modals on `bg-popover`.

## Structural Zones

| Zone       | Background     | Border         | Notes                                    |
| ---------- | -------------- | -------------- | ---------------------------------------- |
| Header     | bg-card        | border-b       | Navigation, title, region selector       |
| Sidebar    | bg-sidebar     | border-r       | Region selection checkboxes, filters     |
| Content    | bg-background  | —              | Regional cards grid, chart container     |
| Footer     | bg-muted/20    | border-t       | Legend, timestamp, source attribution    |

## Spacing & Rhythm

Grid-based 4px system; region cards grouped in rows with 2rem gaps, chart container separated by 3rem top margin, micro-spacing within cards (1rem padding).

## Component Patterns

- Buttons: `rounded-sm` (4px), primary color with hover opacity shift, no shadow
- Cards: `rounded-md` (8px), `bg-card` with `border-border`, compact 1rem padding
- Badges: `rounded-sm` with semantic chart colors for trend direction
- Region cards: `flex gap-4` with price/sparkline side-by-side, semantic background tint overlay

## Motion

- Entrance: Staggered fade-in on load (100ms between cards), no bounce
- Hover: Card shadow lift + opacity increase on region cards, chart line highlight on hover
- Decorative: None; all motion serves interactivity signals

## Constraints

- No gradients on backgrounds (solids only for focus/clarity)
- Chart colors must maintain AA contrast in both light and dark modes
- Regional hierarchy visually distinct via nested card sizing (도 > 시 > 구)
- Korean text rendering: body font at `font-500` or higher for readability at small sizes

## Signature Detail

Embedded sparkline mini-charts on region cards showing 12-month price movements inline — users identify market trends at a glance without leaving the dashboard view (interactive microdata visualization pattern).



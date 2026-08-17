# Design system

All tokens live in `src/app/globals.css` as CSS custom properties. This
doc explains the reasoning so future changes stay consistent — read it
alongside the file, not instead of it.

## The constraint that drives everything

The primary reading condition is: **standing at a counter, a phone or
tablet propped up a couple feet away, kitchen lighting (often bright and
sometimes glary off a screen), hands occupied or messy.** That rules out
anything that depends on close reading or precise taps:

- Body text starts at `--font-size-base` (18px) — noticeably larger than
  typical web body copy.
- Cook mode's instruction text uses `--font-size-step`, a `clamp()` that
  scales up to 3.25rem on larger screens — it's the one piece of text on
  screen and should dominate it.
- Every tappable control is at least `--tap-min` (3.25rem / 52px) in its
  smallest dimension — well above the ~44px baseline, because fingers may
  be wet, gloved, or imprecise.

## Color

Two palettes, switched automatically via `prefers-color-scheme`:

- **Light** (default): warm off-white background, near-black text — chosen
  over pure white/black because bright kitchen lighting glares less off a
  slightly warm surface, and near-black text avoids the slight halation
  pure `#000` can have on some phone screens.
- **Dark**: for evening cooking / dim kitchens. Same structure, inverted
  luminance.

Brand colors: `--color-primary` (purple) for primary actions and
selected/active state; `--color-accent` (banana yellow) reserved for the
timer control specifically, so it reads as a distinct, attention-grabbing
affordance rather than blending into general UI chrome. Don't introduce a
third accent color — it dilutes that signal.

Every text/background pairing needs to clear **WCAG AA contrast** (4.5:1
for body text). When adding a new color pairing, check it — this matters
more than usual here given the harsh-lighting use case.

## Type

System font stack only (`system-ui, -apple-system, "Segoe UI", Roboto,
Helvetica, Arial, sans-serif`) — deliberately no webfont. A webfont is a
network request the offline-first promise of this app shouldn't depend on,
and system fonts render instantly on a cold cache.

Scale (`--font-size-*`): `base` (18px) → `lg` (22px) → `xl` (28px) → `2xl`
(36px) → `step` (28px–52px, fluid). Headings and card titles use `lg`/`xl`;
only cook mode's instruction text uses `step`.

## Spacing & shape

`--space-1` through `--space-6` (0.5rem–3rem) cover all layout gaps and
padding — pick from that scale rather than one-off values. Large radii
(`--radius`, `--radius-lg`) throughout; soft, obviously-tappable shapes fit
a low-precision-touch context better than sharp corners.

## Cook mode specifically

`.cook-mode` is intentionally the most restrained screen in the app: a
progress bar, one step number, one instruction, an optional timer pill,
and two nav buttons. Resist adding anything else to it — every extra
element competes with the one thing the screen exists to deliver, at the
exact moment (mid-recipe, hands busy) the user has the least attention to
spare.

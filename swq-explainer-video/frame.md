# frame.md — Spot the Weak Question explainer

Brand truth, captured from the simulation itself (`../spot-the-weak-question-chat/styles.css`, `intro.css`) and the Miva Campus brand deck. Motion language from `/Users/mosesjeremiah/Downloads/motion-graphics-breakdown.md`.

## Palette (by role)

| Role | Hex | Source |
|---|---|---|
| Ground (off-white, warm) | `#FDF7EC` → `#FFFDF8` | sim `--gradient-light-page` |
| Bloom: cream (top-right) | `#FCEBCC` @ 55% | sim page gradient |
| Bloom: amber (bottom-left) | `#EE9B01` @ 12% | sim page gradient |
| Bloom: blue (top-left) | `#1D5BD6` @ 10% | added for the reference's four-corner blooms |
| Bloom: mint (bottom-right) | `#27C88A` @ 10% | added for the reference's four-corner blooms |
| Ink (headlines, body) | `#0A2437` | sim `--text-dark` |
| Muted ink (neutral headline words) | `#4C5C6B` | sim `--text-mid` |
| Accent (key words, buttons, cursor ripple) | `#1D5BD6` | sim `--accent` |
| Navy (brand mark, end card) | `#09314F` | brand deck |
| Amber (highlight block behind "Weak") | `#EE9B01` with brown `#472E00` text | brand deck / opener |
| User bubble | `#FCEBCC` fill, `#472E00` text | sim `.bubble` |
| Reply card | `#FFFFFF`, border `rgba(9,49,79,.14)` | sim `.reply` |
| Resilient badge | `#E7F4EC` fill, `#1C7A4B` text | sim `.tier-resilient` |
| Vulnerable badge / feedback | `#FBE7E2` fill, `#A3342A` text | sim `.tier-vulnerable` |
| Kemi feedback (correct) | `#E7F4EC` fill, `#173F2B` text | sim `.coach-body.ok` |

Accent words are **solid** accent blue, not a gradient (contrast on the cream ground, and the house-style gradient-text ban).

## Type

| Role | Family | Use |
|---|---|---|
| Display | Afacad 600–650 | headlines 84–110px, title 150px |
| Sans | Manrope 500–700 | UI text inside the window, 26–34px at video scale |
| Labels | Manrope 700, uppercase, 0.08em | eyebrows, 22px |

Fonts are bundled locally (`assets/fonts/`), never fetched at render time.

## Shape and depth

- UI window: white, radius 36px, border `2px rgba(9,49,79,.12)`, soft shadow `0 40px 120px rgba(9,49,79,.16)`, thin accent edge glow.
- Window pose: perspective 2000px, rotateY −10°, rotateX 4° at rest; flattens (0°) when the camera pushes in.
- Radii: bubbles 32px (6px on the speaker corner), cards 28px, pills 999px.
- Cursor: oversized white pointing hand, 3px `#0A2437` outline, ~1.8× normal.

## Easing (use only these)

| Name | Curve | Use |
|---|---|---|
| emphasized-decel | `cubic-bezier(0.05, 0.7, 0.1, 1)` | entrances, camera settles, word reveals |
| emphasized-accel | `cubic-bezier(0.3, 0, 0.8, 0.15)` | exits, blur-outs, zoom-throughs |
| standard | `cubic-bezier(0.2, 0, 0, 1)` | cursor, highlight bars, morphs |
| gentle-in-out | `cubic-bezier(0.65, 0, 0.35, 1)` | long pans, drag paths |
| pop | `back.out(1.6)` (≈4% overshoot) | badge, radio dot, end-card mark |

Entrances 0.25–0.45s · exits 0.15–0.30s · seam overlap 0.08–0.15s · list stagger 30–80ms · headline words ~120ms.

## Do / don't

- Do keep one focal point per moment; blur the rest (depth of field does the staging).
- Do keep the camera drifting 1.00→1.03 in every hold.
- Don't use gradient text, glow halos on type, neon, or pure `#000` / `#fff` text.
- Don't show the assessed simulation questions. Demo question only: "Define opportunity cost."
- Don't add sound.

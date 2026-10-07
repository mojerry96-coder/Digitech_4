# LAYOUT SYSTEM: UNIFORM SCALING

One design, scaled proportionally to every screen. Layout never changes.

## Canvas
- Design canvas width: 1440px. All values in the design are canvas pixels.
- Scrolling website: scale by width only; page height grows naturally.

## Scaling setup (exactly this)
```css
body  { margin: 0; container-type: inline-size; }
.site { --px: clamp(0.711px, calc(100cqw / 1440), 1.6px);
        max-width: calc(1440 * 1.6px); margin-inline: auto; }
```
- All page content lives inside `.site`.
- Use `cqw` (not `vw`) so the vertical scrollbar never causes horizontal overflow.

## Sizing rule
- Every dimension is written as `calc(N * var(--px))`, where N is the canvas value:
  width, height, min/max sizes, padding, margin, gap, font-size,
  line-height, letter-spacing, border-radius, border-width, box-shadow,
  icon/SVG size, top/right/bottom/left offsets.
- Never use raw px, rem, em, %, vw, or vh for sizing. Unitless line-height is allowed.
- No media queries or breakpoints that change layout, order, or visibility.
- Flex/grid placement stays identical; only the sizes scale.

## Supported screens
- 1024px (landscape tablet) up to ultrawide.
- Scale floor 0.711 (at 1024px). Scale ceiling 1.6 (at 2304px and wider);
  beyond that, content is centered and backgrounds extend full-width.
- Full-bleed backgrounds sit outside `.site` or use a full-width wrapper.

## Minimums on the 1440 canvas (so they still work at 0.711 scale)
- Smallest text: 17px. Body text: 18–20px.
- Tap targets (buttons, links, icons, inputs): at least 62px tall/wide.
- Every hover-only interaction must also work by tap.

## Images
- Export at 2x canvas size (covers retina laptops and 1.6x monitors).
- Hero images: 3x if they must look sharp on 5K displays.
- Size images with `calc(N * var(--px))` or fill a scaled container; use object-fit.

---

## Reference: the math

```
scale         = clamp(0.711, viewport width / 1440, 1.6)
rendered size = canvas size × scale
```

| Screen (CSS px) | Example | Scale |
|---|---|---|
| 1024 | older iPad, landscape | 0.711 |
| 1180 | iPad Air / iPad, landscape | 0.819 |
| 1280 | small laptops | 0.889 |
| 1366 | iPad Pro 13", many Windows laptops | 0.949 |
| 1440 | design canvas | 1.000 |
| 1536 | Windows laptops at 125% zoom | 1.067 |
| 1920 | standard desktop monitor | 1.333 |
| 2560 / 3440 | QHD / ultrawide | 1.6 (capped, centered) |

Why the minimums: at the 0.711 floor, 17px canvas text renders at ~12px and a
62px canvas button renders at ~44px (Apple's minimum tap target).

# Spot the Weak Question — The Flip-Test Challenge

Single-page simulation for AI Literacy · Unit 2.4 (MIVA / Digi-Teach). Built from
`../Spot_Weak_Question_Replication/Spot_Weak_Question_Replication_Prompt.md`, with the MIVA
logo opener from `../opener/` (retitled) and the uniform scaling system in `../LAYOUT-SYSTEM.md`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. Useful URLs:

- `/?skipintro`: skips the logo opener.
- **Preview mode** (top right) → *Reset session and replay* clears saved progress.

## Flow

Opener → Cover → Run the flip test (3) → Redesign and retest (2 × 2 attempts) → One more,
unaided → Your question audit, plus optional Practice Again (2 bank questions, not scored).
Progress is saved to `localStorage` after every change and restored on refresh.

## Where things live

| Path | What |
|---|---|
| `src/content/questions.ts` | All authored questions, replies and answer keys |
| `src/state/session.ts` | Session evidence types and guarded transitions (pure functions) |
| `src/state/useSession.ts` | Persistence and session creation |
| `src/lib/evaluator.ts` | **The only AI seam**: live HTTP evaluator or preview fixtures |
| `src/lib/zoom.ts` | Keeps browser zoom working under uniform scaling |
| `src/components/*` | Opener, Cover, Test, Redesign, Cold, Audit |
| `src/styles/app.css` | Tokens, `--px` scaling, every component style |

## Layout system

1440px canvas; every size is `calc(N * var(--px))`, where
`--px = clamp(0.711px, 100cqw × zoom / 1440, 1.6px)`. Verified with no overflow in any
state at 1024×768, 1366×768, 1440×810, 1920×1080 and 3440×1440 (content caps at 2304px
and centres). Each state is designed to fit within 1440 × 810 canvas pixels.

## Handing over to Lovable

1. **AI evaluator.** Build the protected backend function described in section 11 of the
   replication prompt (`evaluate-question`, request/response contract, fixed system
   instruction, server-side validation and idempotency by request ID). Then set:
   - `VITE_EVALUATOR_URL`: the function's URL
   - `VITE_EVALUATOR_KEY`: the public anon key, if the function requires one

   With a URL set, preview mode and its sample-draft helper disappear automatically. The
   client already validates every result: Resilient is rejected unless
   `dependsOnSpecificCourseMaterial`, `preservesOriginalTopic` and `evidenceReference` agree.
2. **Persistence.** Local storage is the prototype store. For programme tracking, persist the
   `Session` object (or its evidence fields) through Lovable's backend.
3. **Host completion.** `App` accepts an optional `onFinish(session)` callback. Without one,
   Finish shows an in-page completion line.
4. **Cover motion graphic.** Set `COVER_MEDIA` in `src/components/Cover.tsx` once the silent
   24s loop exists. Until then the cover shows the static question-stack artwork.

## Known limits

- Browser-zoom tracking relies on `devicePixelRatio`, which Safari doesn't change on zoom,
  so the fix has no effect there. Moving the window between screens of different pixel
  density can also skew it until reload.
- Below 1024px wide the scale stops shrinking and the page scrolls sideways (tablet
  landscape and up only, by design).

# Spot the Weak Question — chat simulation replication prompt

Version 2.0 · 7 October 2026 · British English
Supersedes v1.0 (the open two-region layout). v1.0 is kept in git history only.

## Paste this instruction into Lovable

Build **Spot the Weak Question: The Flip-Test Challenge** as a single-page, chat-style simulation, following this specification and the ten reference screens in `screens-chat/`. It is **one conversation and one action dock** on a single route. Every state is derived from one session object; nothing navigates. Use React and TypeScript. The code blocks below are contracts and reference implementations to port, not optional suggestions.

The learner is a lecturer checking exam questions before students see them. They run the **flip test** (ask AI the question the way a student would), judge each question **Vulnerable** or **Resilient**, redesign the two weak ones so they depend on something only their class has, then do one more on their own. A voiced explainer video teaches the routine before they start, and an audit card closes the run.

A working reference build exists in the project repository at `spot-the-weak-question-chat/` (vanilla JS). Where this document and that build disagree, this document wins. Copy its assets as listed in §17; do not redraw them.

### Instruction precedence

1. This specification and the user's latest decisions.
2. The ten PNGs in `screens-chat/` (visual reference for layout, hierarchy and type).
3. The reference build in `spot-the-weak-question-chat/` (behaviour and exact styling where this document is silent).
4. `references/Original_Storyboard.pdf` for learning intent only.

Do **not** restore anything from v1.0: no two-column workspace, no navy audit page, no evidence tabs, no auto-advance timers, no "Keep result open", no preview mode, no `Start the Audit` cover with paper cards.

### What changed from v1.0, and why

Learners found v1.0 confusing. It never explained the two words, "Ask AI" felt like a button rather than asking, judgements got no feedback, and free-text redesigns failed without live AI. v2.0 fixes each one:

| Problem in v1.0 | v2.0 answer |
|---|---|
| "Vulnerable" and "Resilient" were never defined | Both options always show their meaning; the walkthrough video teaches them |
| "Ask AI" didn't feel like asking | The learner sends the question into a chat; Sage (the AI) replies |
| No feedback on judgements | Kemi gives one line of feedback after each flip-test judgement (rounds 1–2 only) |
| Redesign failed without live AI | A deterministic rubric checker answers any text; live AI is optional (§14) |
| Too many mechanics | Auto-advance, attempt banners and tabs removed; one dock, one action |

## 1. Reference screens

| File | State shown |
|---|---|
| `screens-chat/01_Opener.png` | Opener, finished frame: three partner logos, title, **Begin** |
| `screens-chat/02_Question_Stack.png` | First conversation state: Tade, intro step, **Start the audit** |
| `screens-chat/03_Flip_Test_Judgement.png` | Question sent, Sage replied, judgement chosen, **Confirm judgement** enabled |
| `screens-chat/04_Feedback_Next_Question.png` | Kemi's feedback after a wrong call; the next question waits in the ask card |
| `screens-chat/05_Redesign_Still_Vulnerable.png` | A redesign with only a week label: **Still vulnerable** + reason; 1 try left |
| `screens-chat/06_Redesign_Resilient.png` | A case-study redesign: **Resilient**; **Next question** |
| `screens-chat/07_Unaided_Judgement_And_Fix.png` | Unaided question: Vulnerable chosen, course-specific fix typed, **Submit** |
| `screens-chat/08_Audit_Top.png` | Audit card: headline and flip-test strand |
| `screens-chat/09_Audit_Redesign_And_Unaided.png` | Audit card: redesign strand (original vs final) and the unaided strand |
| `screens-chat/10_Practice_Result.png` | An optional practice question's result card, marked **Not scored** |

The screens are 1440×810 captures of the reference build with real (not staged) learner choices, so scores in them are examples. Rebuild everything as accessible HTML; never place a screenshot behind hotspots.

## 2. Non-negotiable product rules

- One route, one page, one persistent shell: top bar, conversation thread, action dock. No scene URLs or page reloads.
- The **thread is append-only and derived from state**. New items are appended at the bottom; existing items never re-render or reorder.
- The **dock is the only place the learner acts**, and shows one action at a time.
- Sage (the AI) replies are simulated: prepared strings for the five fixed questions, and the rubric checker (§11) for redesigns. No live LLM call is required.
- Both judgement options always show their definitions. Definitions explain the words, never the answer.
- Feedback after each **flip-test** judgement (Kemi). **No feedback** on the unaided question or practice questions until the audit.
- The redesign field is seeded with the original weak question only. The unaided fix field starts empty.
- Messages that aren't a redesign (greetings, help requests, gibberish, the unchanged original, a repeat, a different topic) get an in-character reply from Sage and **use no try** (§12).
- Untimed. No countdowns, points, leaderboards, confetti, badges for achievement, or pass/fail labels.
- Store the learner's own words and choices exactly. Never rewrite them.
- British English throughout ("judgement", "behaviours", "analysed", "colour").
- Never show the assessed questions or answers before the learner commits, including in the walkthrough video (it uses the demo question "Define opportunity cost.").

## 3. Flow

```text
Opener → Walkthrough video → Question stack → Flip test ×3 → Redesign ×2 → One more, unaided → Audit
                                                                                   ↘ Practice again ×≤2 (optional, not scored) ↗
```

| Stage | Top-bar label | Dock shows | Next |
|---|---|---|---|
| `intro` | — | **Start the audit** | `flip-ask` |
| `flip-ask` | Run the flip test | Ask card with the current question | `flip-judge` |
| `flip-judge` | Run the flip test | Judgement options + **Confirm judgement** | `flip-ask`, or `flip-done` after the third |
| `flip-done` | Run the flip test | **Redesign the weak ones** | `redesign` |
| `redesign` | Redesign and retest | Composer, 2 tries | stays, or `redesign-done` when Resilient or out of tries |
| `redesign-done` | Redesign and retest | **Next question** (first item) / **Continue** (second) | `redesign` (item 2) / `cold-ask` |
| `cold-ask` | One more, unaided | Ask card | `cold-judge` |
| `cold-judge` | One more, unaided | Judgement + conditional fix field + **Submit** | `cold-done` |
| `cold-done` | One more, unaided | **See your audit** | `end` |
| `end` | Your question audit | **Practice again** (optional) + **Finish** | `practice-ask` / `closed` |
| `practice-ask` | Extra practice | Ask card | `practice-judge` |
| `practice-judge` | Extra practice | Judgement + conditional fix + **Submit practice** | `end` (or `closed` if already finished) |
| `closed` | Your question audit | **Practice again** (if any left) + **Start again** | — |

The redesign queue is always **market segmentation, then noble gases**, whatever the learner judged. A wrong judgement never removes or adds a redesign.

## 4. Architecture

```text
AppShell
  TopBar            brand mark · "Spot the Weak Question" · stage label · replay-walkthrough button
  Thread            scrollable column; items derived from Session (§9); append-only
  Dock              one view per stage (§3); the only interactive surface
  LiveRegion        aria-live="polite" announcements
  Opener            modal overlay (§7)
  WalkthroughVideo  modal overlay (§8)
```

### Thread item kinds

| Kind | Look | Used for |
|---|---|---|
| `step` | amber uppercase eyebrow + Afacad 30px line (+ optional sub line), optional character clip above | stage openers |
| `user` | right-aligned cream bubble with a small meta label above | questions sent, redesigns, judgements, fixes |
| `ai` | Sage avatar + white reply card; optional verdict badge + note above the card | Sage's replies |
| `coach` | Kemi avatar + mint (correct) or rose (incorrect) feedback card with a tick or cross | flip-test feedback |
| `divider` | centred label between hairlines | "Question 1 of 2 · Market segmentation" |
| `line` | centred small grey line with a lock icon | "Recorded. You'll see how it went in your audit." |
| `card` | white rounded card | the audit card, practice result cards |

### Thinking, then reveal

Every **new** `ai` item first shows Sage thinking: the `sage-think` clip with a working line, then the reply rises in.

- First line (random pick): "Reading the question…" · "Taking that in…" · "Looking at what's being asked…"
- After 0.8s it changes to: "Writing an answer…" · "Putting that together…" · "Drafting a reply…"
- Reveal after **1.7s** (asides: 0.9s; reduced motion: 0.15s). The dock is busy and disabled while thinking.
- Other new items rise in (`translateY(8px) → 0`, 460ms, `cubic-bezier(0.22,1,0.36,1)`). The thread scrolls smoothly to the newest item.

Pick the working line deterministically if you need reproducible tests; randomness here is cosmetic only.

## 5. Layout system: uniform scaling

The design is drawn once on a **1440px canvas** and scaled to fit every screen from 1024px (landscape tablet) to ultrawide. Layout never changes; there are no breakpoints. Every size is `calc(N * var(--px))`, where N is canvas pixels.

```css
:root {
  --zoom: 1; /* set by the zoom script below */
  --px: clamp(0.711px, calc(100cqw * var(--zoom) / 1440), 1.6px);
}
body { container-type: inline-size; } /* body width excludes the scrollbar, so 100cqw never overflows */
```

```ts
// Keep browser zoom working: zooming shrinks the CSS width, which would cancel the scale.
const base = window.devicePixelRatio || 1;
const syncZoom = () =>
  document.documentElement.style.setProperty("--zoom", String(Math.max(1, (window.devicePixelRatio || 1) / base)));
syncZoom();
window.addEventListener("resize", syncZoom);
```

Rules: the smallest text anywhere is **17 canvas px** (12px on a 1024 tablet); tap targets are at least **62 canvas px**; the chat column is **760 canvas px** wide with a 32px gutter. In Tailwind, use arbitrary values (`text-[calc(19*var(--px))]`) or a tiny `px(n)` helper; don't mix in raw px/rem sizes.

## 6. Visual system

Ported from Fix the Prompt (Miva Campus brand) so both simulations read as one family.

```css
:root {
  --font-display: "Afacad", system-ui, sans-serif;   /* weights 400–700 */
  --font-body: "Manrope", system-ui, sans-serif;     /* weights 400–800 */

  --navy: #09314F; --brown: #472E00; --amber: #EE9B01; --amber-deep: #C67F01; --cream: #FCEBCC;
  --paper-050: #FDF8EF; --paper-100: #FBF0DB;
  --accent: #1D5BD6; --accent-hover: #174CB5;           /* buttons, send, focus, try dots */
  --mint-100: #E7F4EC; --mint-700: #1C7A4B;             /* Resilient, correct */
  --rose-100: #FBE7E2; --rose-700: #A3342A;             /* Still vulnerable, incorrect */
  --text-dark: #0A2437; --text-mid: #4C5C6B; --text-soft: #5F6C78;
  --line-light: rgba(9, 49, 79, 0.14); --line-strong: rgba(9, 49, 79, 0.26);
  --page:
    radial-gradient(ellipse at 100% 0%, rgba(252, 235, 204, 0.55), transparent 42%),
    radial-gradient(ellipse at 0% 100%, rgba(238, 155, 1, 0.10), transparent 40%),
    linear-gradient(180deg, #FFFDF8 0%, #FDF7EC 100%);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Component sizes (canvas px):

| Component | Spec |
|---|---|
| Top bar | padding 22 / 32; MIVA mark 28; brand name 17/700 ink; stage label 17/600 navy; replay icon button 56 round |
| Thread | gap 36; padding-top 48, bottom 72 |
| Step | eyebrow 17/700 caps, 0.08em, amber-deep; line Afacad 30/600, −0.02em; sub 19/500 mid; character clip 120 wide |
| User bubble | max 86% / 620; padding 15 / 22; radius 22 22 6 22; cream fill, brown text 19/1.5; meta label 17/600 soft; judgement bubbles bold |
| Sage reply | avatar 44 round; card padding 20 / 24, radius 20, white, hairline border, 19/1.6 |
| Verdict badge | pill, min-height 36, 17/700, icon 20: Resilient (shield-check, mint) / Still vulnerable (warning-circle, rose); note 17 mid beside it |
| Coach card | Kemi avatar 44 (cropped to face); card padding 18 / 22, radius 20, 19/1.55; mint `#173F2B` text or rose `#4E1D17` text; check-circle / x-circle 26 |
| Dock | max width 760; panel padding 18 / 20, radius 26, white 94%, strong border, soft shadow; a lone composer sits without the panel |
| Ask card | composer frame: question text 19, foot with meta 17 soft + **Ask AI ↑** pill (62 tall) |
| Composer | radius 20; textarea 19/1.5, auto-grows to ~40% of its width; foot: try dots (11, accent outline, filled when used) + "N tries left" 17 + round send button 62 |
| Judgement | "Is this question…" 19/700; two equal cards side by side, min-height 92, radius 18, radio 24 + title 20/700 + definition 17 mid; selected: accent border + inset ring, `#F4F8FF` fill |
| Fix field | label "Your course-specific fix" 17/700; textarea radius 16, min-height 84 |
| Primary button | pill, min-height 64, padding 0 32, 19/700, accent fill, arrow icon; hover lifts 2px; disabled 42% opacity |
| Ghost button | pill, min-height 62, white, strong border, 18/600, optional small 17 soft sub-label inline |
| Audit card | padding 30 / 32, radius 24, white 90%; title Afacad 40/650; sections separated by hairlines, h3 Afacad 24 |

Icons: Phosphor (regular, bold, fill). Status is always text + icon + colour, never colour alone. Focus ring: 3px amber, offset 3.

## 7. Opener (MIVA shell)

Port the reference build's opener (`spot-the-weak-question-chat/intro.js` and `intro.css`) exactly. Its behaviour:

- Logos left→right: `ekiti.svg` 74 · `miva.svg` 164 · `tof.svg` 118 (canvas px), gap 46, 1px rules (52 tall) between them after all three settle.
- **The row slides; the logos never fly.** Each logo fades in (opacity 0→1, blur 8→0, scale 1.1→1) at its own slot while the row re-centres on whatever has arrived. Measure layout offsets, not `getBoundingClientRect` (which includes the entry scale), and note that the transformed row may be the logos' `offsetParent`.
- Timeline (ms): 350 crest · 1350 MIVA · 2350 Foundation · 3550 rules + chevron motif · 3800 title · 4450 Begin (takes focus).
- Tagline "STUDY. ANYWHERE. ANYONE. ANYTIME." 17/700 cream 85%. Title **SPOT THE WEAK QUESTION**, Afacad 72/650, "WEAK" in amber. Sub "AI LITERACY · UNIT 2.4" 17/700.
- **Begin**: amber fill, brown text. **Skip / Esc** jumps to the finished frame (it does not skip the opener), because the Begin click is what unlocks audio for the video.
- Reduced motion shows the finished frame. A returning learner (saved session) and `?skipintro` bypass it.

## 8. Walkthrough video

Begin hands over to a 1.7s loading screen (`tade-walk` clip), then the explainer video, then a 1.3s loading screen, then the conversation.

- Assets: `assets/video/explainer.mp4` (36.9s, 1920×1080, H.264 + AAC voiceover) and `assets/video/explainer.en.vtt` (English captions).
- Full-screen overlay on the page gradient: "HOW IT WORKS" eyebrow top-left; **mute** icon button and **Skip** ghost button top-right; a 16:9 frame (radius 24, soft shadow) fitted to the viewport; a thin accent progress bar along the bottom.
- `playsinline`, sound **on** (the Begin click unlocks it). If `play()` rejects, mute and play anyway, and let the learner unmute. **Captions on by default** (`<track default>`, mode `showing`), styled Manrope white on `rgba(10,36,55,.78)`.
- From **29.2s** (when the drawn **Let's begin** button has landed on the end card), show a real **Let's begin →** button laid exactly over it and give it focus. Geometry, as a fraction of the frame: centre 50% / 51.1%, height 9.63%, font 3.7%, horizontal padding 5.37%, gap 1.48% (use container query units on the frame). Accent fill, white Manrope 800.
- Let's begin, Skip and Esc all close the overlay. The top-bar replay button replays the video.
- If the video errors, fall back to the scripted captioned walkthrough in the reference build's `walkthrough.js` (`runScripted`), or go straight to the conversation.

## 9. Stage content and behaviour

Copy every string below exactly.

### 9.1 Intro

- Step (with the `tade-puzzled` clip): eyebrow **The question stack**; line "Three exam questions are about to go in front of students. Before they do, run the flip test on each one."
- Dock: **Start the audit →**.

### 9.2 Flip test (three questions, with feedback)

- On entry, append a step: eyebrow **Run the flip test**; line "Ask the AI each question, the way a student would. Then judge it."
- `flip-ask` dock: ask card with the question text, meta "Question N of 3 · send it as a student would", button **Ask AI ↑**.
- On Ask: append user bubble (meta "Question N of 3", the question), then Sage's prepared reply (thinking → reveal). Then the dock becomes `flip-judge`.
- `flip-judge` dock: "Is this question…" + the two definition cards (no preselection) + **Confirm judgement →** (disabled until a choice). Arrow keys move between options; the choice can change until Confirm.
- On Confirm: store the choice once; append user bubble (meta "Your judgement", bold label) and Kemi's coach card:
  - correct: **"Yes, {expected}."** + feedback · incorrect: **"Not quite. This one is {expected}."** + feedback (expected in lower case).
- After the third, the dock shows **Redesign the weak ones →** so the last feedback can be read.

### 9.3 Redesign and retest (two questions, two tries each)

- On entry, append a step: eyebrow **Redesign and retest**; line "Two of these could be answered without your course. Make each one depend on something only your class has."; sub "For example, a case study, a dataset or a lab result from your class. Two tries each."
- Per item: divider "Question N of 2 · {label}", then a user bubble (meta "The weak question", the original).
- Dock: composer pre-filled with the original question, placeholder "Redesign the question…", two try dots + "2 tries left". **Enter sends; Shift+Enter adds a line.** The send button has `aria-label="Test it"`.
- On send:
  1. Run the intent check (§12). If it returns an aside, append the learner's message (meta "You") and Sage's dashed aside reply; **no try used**. Clear the composer for chatty, asking and unreadable asides; keep the text for unchanged, repeat and off-topic.
  2. Otherwise run the checker (§11), record the attempt, and append user bubble (meta "Your redesign") + Sage reply with the verdict badge and note above the card.
  3. Status becomes `resilient` on a Resilient verdict, `unresolved` after two Still vulnerable tries, otherwise stays `pending` (composer stays, now "1 try left").
- When closed: dock **Next question →** (item 1) or **Continue →** (item 2). No auto-advance.

### 9.4 One more, unaided (no feedback)

- Append a step: eyebrow **One more, unaided**; line "A question from a different subject. No feedback this time: test it and judge it on your own."
- Ask card (meta "Send it as a student would") → user bubble (meta "The question") + Sage's prepared reply.
- Judgement dock with **conditional fix field**: choosing Vulnerable reveals "Your course-specific fix" (empty); choosing Resilient hides it, but keeps the draft if they switch back. **Submit →** is enabled when a choice is made and, for Vulnerable, the fix has at least 2 non-space characters.
- On Submit: lock the result once (no resubmission); assess the fix silently (§13); append user bubbles "Your judgement" and "Your fix" (if any), then the line "Recorded. You'll see how it went in your audit." Dock: **See your audit →**.
- Do not hint the answer anywhere. In particular, never say "name your fix" before the learner chooses, because a fix is only asked for when they judge it vulnerable.

### 9.5 Your question audit (one card in the thread)

- Character clip `trio-cheer`; eyebrow **Your question audit**; title **"You spotted {c} of 3, and made {r} of 2 resilient."**
- **Flip test** · "{c} of 3 correct": one row per question with a tick or cross icon (plus sr-only "Correct"/"Incorrect"), the label, and "You said {choice}. Correct: {reason}" or "You said {choice}. It's {expected}: {reason}" (reason in lower-case first letter).
- **Redesign** · "{r} of 2 resilient": per item, label + verdict badge + "{n} tries"; two side-by-side boxes **Original** / **Your final version**; the last attempt's note below.
- **One more, unaided** · "Judged correctly" or "Misjudged": the question; "You said {choice}" / "Answer {expected}"; the causal explanation (§10 `explain`); if a fix was given: "Your fix "{fix}"" + badge **Course-specific** (mint) or **Too generic** (rose) + the assessment note.
- Closing line: "Next: take one real question from your own course, and redesign it the same way."
- Dock: ghost **Practice again** with inline sub-label "Optional · doesn't change your result" (`aria-describedby`), or the text "All practice questions done"; then primary **Finish →**.
- **Finish**: mark complete, post `{ type: "spot-the-weak-question:complete", result }` to `window.parent` when embedded (and call an `onFinish(result)` prop if the host provides one), then show **Start again** (ghost) in the dock. Practice stays available after Finish.

### 9.6 Practice again (optional, not scored)

- Draws the next unused item from a bank of two, in an order shuffled once per session and saved. Each item is used at most once.
- Appends: step eyebrow **Extra practice · not scored**, line "One more on your own. Your recorded result won't change."; then the same ask → reply → judgement (+ fix) flow as §9.4, with meta "Extra practice · send it as a student would" and **Submit practice →**.
- On submit, append a practice card: label + "Not scored" dashed chip + **Judged correctly** / **Misjudged** badge, then the same detail block as the unaided strand. The official result never changes.

## 10. Content

```ts
export type Classification = "vulnerable" | "resilient";
export type QuestionId = "market" | "noble" | "source" | "water" | "practice-immunity" | "practice-trial";

export const QUESTIONS: Record<QuestionId, {
  id: QuestionId; label: string; text: string; reply: string; expected: Classification;
  feedback?: string; reason: string;
}> = {
  market: {
    id: "market", label: "Market segmentation", text: "Define market segmentation.",
    reply: "Market segmentation is the process of dividing a market into distinct groups of buyers with different needs or behaviours.",
    expected: "vulnerable",
    feedback: "Sage gave a complete textbook definition without knowing anything about your course. A student could paste that straight in.",
    reason: "A textbook definition answered it.",
  },
  noble: {
    id: "noble", label: "Noble gases", text: "List the noble gases.",
    reply: "The group 18 elements are helium, neon, argon, krypton, xenon, radon and oganesson.",
    expected: "vulnerable",
    feedback: "One standard list answered it completely. Nothing in the question needs your class.",
    reason: "A standard list answered it.",
  },
  source: {
    id: "source", label: "Primary source",
    text: "Using the primary source document we analysed in week six, explain why the author's account differs from the textbook version.",
    reply: "I don't have access to the specific primary source your class analysed in week six, so I can't compare it to the textbook account.",
    expected: "resilient",
    feedback: "Sage couldn't answer, because the question depends on the week-six source your class analysed. That's what a strong question looks like.",
    reason: "It depends on the source your class analysed.",
  },
  water: {
    id: "water", label: "Water cycle", text: "Explain the water cycle.",
    reply: "Water evaporates, condenses into clouds and returns as precipitation. It collects in rivers, lakes and oceans, and the cycle continues.",
    expected: "vulnerable", reason: "Sage answered completely with no class material.",
  },
  "practice-immunity": {
    id: "practice-immunity", label: "Immunity", text: "Explain how vaccines create immunity in the body.",
    reply: "Vaccines train the immune system to recognise a pathogen or part of it. This builds immune memory, which supports a faster response to later exposure.",
    expected: "vulnerable", reason: "A general explanation answered it without class material.",
  },
  "practice-trial": {
    id: "practice-trial", label: "Vaccine trial",
    text: "Using the dataset we reviewed in week nine, which vaccine trial showed the strongest results, and why?",
    reply: "I don't have the specific dataset your class reviewed in week nine, so I can't tell which trial showed the strongest results.",
    expected: "resilient", reason: "The comparison needs the week-nine dataset your class reviewed.",
  },
};

export const FLIP_IDS = ["market", "noble", "source"] as const;
export const REDESIGN_IDS = ["market", "noble"] as const;
export const PRACTICE_IDS = ["practice-immunity", "practice-trial"] as const;
export const LABEL = { vulnerable: "Vulnerable", resilient: "Resilient" } as const;
export const DEFINITION = {
  vulnerable: "AI can answer it without anything from your course.",
  resilient: "AI can't answer it without something only your class has.",
} as const;

/** Causal explanation for the unaided and practice questions, shown only in the audit. */
export function explain(id: QuestionId, choice: Classification): string {
  const q = QUESTIONS[id];
  const right = choice === q.expected;
  if (q.expected === "vulnerable") {
    return right
      ? "Sage answered it instantly and completely, with no class material. That's the warning sign."
      : "This one is vulnerable. Sage's reply used no class material at all: it answered instantly and completely, which is the warning sign.";
  }
  const r = q.reason.charAt(0).toLowerCase() + q.reason.slice(1);
  return right ? `Sage couldn't answer. ${q.reason}` : `This one is resilient. Sage couldn't answer, because ${r} There was nothing to fix.`;
}
```

## 11. Redesign checker (deterministic rubric)

A redesign is **Resilient** only when it still asks about the original topic **and** names material the class itself produced or examined **and** that material belongs to this class **and** the task uses it (not a definition decorated with a class reference). Port this exactly; it is the simulation's authored rubric, and it must behave identically everywhere.

```ts
const norm = (s: string) => String(s || "").replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

// Material a class produces or examines itself: AI cannot know it.
const DATA_NOUNS =
  "case[- ]stud(?:y|ies)|data[- ]?sets?|data|results?|readings?|observations?|measurements?|recordings?|" +
  "findings|figures|records?|logbooks?|lab(?:oratory)?(?: work)?|practicals?|experiments?|field[- ]?(?:trip|work|visit)s?|" +
  "site visits?|surveys?|questionnaires?|interviews?|transcripts?|responses|guest (?:lecture|speaker|talk)s?|" +
  "debates?|role[- ]?plays?|primary sources?|source documents?|archives?|samples?|specimens?|projects?|portfolios?|" +
  "company|firm|business|organi[sz]ation|brand|campaign|scenario|example|incident|placement";
const DATA_RE = new RegExp("\\b(" + DATA_NOUNS + ")\\b", "i");
// Material that only repeats general knowledge: AI can still answer.
const INFO_RE = /\b(lecture notes?|notes|slides?|handouts?|textbooks?|reading list|readings? list|course ?book|lectures?|videos?|articles?)\b/i;
// Signals that the material belongs to this class.
const OWN_RE = /\b(we|our|us|your class|the class|this class|in class|this course|our course|week[- ](?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)|session \d+|lab \d+|practical \d+|last (?:week|term|semester|lesson|class))\b/i;
const CLASS_VERB_RE = /\b(collected|recorded|gathered|observed|measured|visited|analy[sz]ed|reviewed|watched|ran|conducted|carried out|handed out|supplied|provided|shared|discussed|studied|examined|interviewed|surveyed)\b/i;
// Weak decorations: a week label or "as discussed" alone.
const DECORATION_RE = /\b(week[- ]\w+|as (?:we )?discussed|as taught|in class|in our (?:lecture|session|class)|from class|do not use ai|don't use ai|without ai)\b/i;
const DEFINE_RE = /\b(define|definition of|what is|what are|meaning of|list|name|state)\b/i;
const ANALYTIC_RE = /\b(why|how|which|compare|contrast|rank|analy[sz]e|interpret|evaluate|assess|justify|explain the pattern|explain why|explain how|identify which|account for|differ|pattern|trend|recommend|apply|calculate|critique|decide|argue)\b/i;

export const TOPIC: Record<"market" | "noble", RegExp> = {
  market: /\b(segment\w*|target(?:ing|ed)?|market\w*|customers?|consumers?|buyers?|audiences?|positioning)\b/i,
  noble: /\b(noble|helium|neon|argon|krypton|xenon|radon|oganesson|group 18|group eighteen|inert gas(?:es)?)\b/i,
};

const GENERIC_REPLY = {
  market: "Market segmentation means dividing a market into groups of buyers who share similar needs, characteristics or behaviours. Firms usually segment by demographic, geographic, psychographic or behavioural variables, then choose which segments to target.",
  noble: "The noble gases are the group 18 elements: helium, neon, argon, krypton, xenon, radon and oganesson. Their full outer electron shells make them very unreactive.",
};
const ORDERED_NOBLE = "In order of atomic number: helium, neon, argon, krypton, xenon, radon and oganesson.";
const CASE_REPLY = {
  market: "Here's a well-known example: a car maker segments by income and lifestyle, offering budget models to students and premium models to professionals. Each group gets its own product, price and message.",
  noble: "Here's a typical example: helium, neon and argon are all unreactive because their outer electron shells are full, and reactivity data usually shows xenon forming a few compounds under extreme conditions.",
};

function cleanNoun(n: string) {
  const s = n.toLowerCase().replace(/-/g, " ");
  if (/^data ?sets?$/.test(s)) return "dataset";
  if (s === "data" || s === "figures" || s === "records" || s === "record") return "data";
  if (/^case stud/.test(s)) return "case study";
  return s.replace(/s$/, "") || s;
}
const withArticle = (noun: string) => (noun === "data" ? "data" : `${/^[aeiou]/.test(noun) ? "an" : "a"} ${noun}`);
function weekPhrase(t: string) {
  const m = t.match(/\bweek[- ](\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/i);
  return m ? `week ${m[1].toLowerCase()}` : "";
}

export type Verdict = { verdict: Classification; reason: string; note: string; reply: string; material: string | null };

export function evaluateRedesign(text: string, id: "market" | "noble"): Verdict {
  const t = norm(text);
  const dataMatch = t.match(DATA_RE);
  const owned = OWN_RE.test(t) || CLASS_VERB_RE.test(t);
  const definitional = DEFINE_RE.test(t) && !ANALYTIC_RE.test(t);
  const ordered = /\b(order|sequence|rank)\b/i.test(t);
  const generic = id === "noble" && ordered ? ORDERED_NOBLE : GENERIC_REPLY[id];

  if (dataMatch && owned && !definitional) {
    const noun = cleanNoun(dataMatch[1]);
    const week = weekPhrase(t);
    const where = week ? ` from your ${week} session` : " your class used";
    return { verdict: "resilient", reason: "depends", material: noun,
      note: `It depends on ${withArticle(noun)} only your class has.`,
      reply: `I don't have the ${noun}${where}, so I can't answer this properly. I could only guess in general terms, and that wouldn't match what your class actually found.` };
  }
  if (dataMatch && owned && definitional) {
    return { verdict: "vulnerable", reason: "decoration", material: null,
      note: "The class reference is decoration: a general answer still works.",
      reply: `I don't need your class material for that. ${generic}` };
  }
  if (dataMatch && !owned) {
    const noun = cleanNoun(dataMatch[1]);
    return { verdict: "vulnerable", reason: "any-material", material: null,
      note: `Any ${noun} would do, so AI picks its own.`,
      reply: /case stud|example|company|firm|scenario/i.test(dataMatch[1]) ? CASE_REPLY[id] : `I can use a typical ${noun} for that. ${generic}` };
  }
  if (INFO_RE.test(t)) {
    return { verdict: "vulnerable", reason: "info", material: null,
      note: "Notes and slides repeat general knowledge, so AI can still answer.",
      reply: `I haven't seen your notes, but they'll say much the same as this. ${generic}` };
  }
  if (DECORATION_RE.test(t) || OWN_RE.test(t)) {
    return { verdict: "vulnerable", reason: "label", material: null,
      note: "A week number or “as discussed” doesn't name any class material.",
      reply: `I don't know what your class covered, but I don't need to. ${generic}` };
  }
  return { verdict: "vulnerable", reason: "generic", material: null,
    note: "New wording, same general question: AI still answers it.", reply: generic };
}

export const onTopic = (text: string, id: "market" | "noble") => TOPIC[id].test(norm(text));
```

The checker must pass these cases (write them as unit tests):

| Item | Redesign | Expected | Reason |
|---|---|---|---|
| market | Define market segmentation. | (aside: unchanged) | no try used |
| market | Explain market segmentation in more detail. | vulnerable | generic |
| market | As we discussed in week four, define market segmentation. | vulnerable | label |
| market | Using the case study we discussed in week four, which segmentation variable explains their targeting strategy, and why? | **resilient** | depends |
| market | Using a case study, explain market segmentation. | vulnerable | any-material |
| market | Explain market segmentation using our lecture notes. | vulnerable | info |
| market | Using the case study we discussed in week four, define market segmentation. | vulnerable | decoration |
| market | Based on the survey responses our class collected at the campus market, which customer segments should the cafe target and why? | **resilient** | depends |
| market | Do not use AI. Define market segmentation. | vulnerable | label |
| noble | Name the noble gases in order. | vulnerable | generic (ordered reply) |
| noble | Using the dataset supplied in our week-three practical, compare the recorded properties of the three named noble gases and explain the pattern. | **resilient** | depends |
| noble | Using the reactivity data we recorded in the week-three lab, rank these three noble gases and explain the pattern you observed. | **resilient** | depends |
| noble | Give an example of how noble gases are used. | vulnerable | any-material |

## 12. Intent check (asides use no try)

Runs before the checker. Returns `{ kind, message }` for a non-redesign, or `null`.

```ts
const lower = (s: string) => String(s || "").toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
const bare = (s: string) => lower(s).replace(/[.!?,;:"']/g, "");
const ASKING = [
  /\b(what|which|how)\b[^?]*\b(should|do|can|would) (i|we)\b/,
  /\b(help me|help please|any help|give me a hint|hint please|tell me what|show me what|what do you think)\b/,
  /^(help|hint|hints|i need help|not sure|no idea|i don'?t know|idk|dunno)\b/,
  /\bwhat('s| is)? (missing|wrong|the answer)\b/,
  /\b(is|was) (this|that|it) (right|correct|ok|okay|good|fine|enough)\b/,
  /\b(give|tell) me the answer\b/,
  /\bcan you (help|tell|show) me\b/,
  /\b(rewrite|redesign|fix) (it|this) for me\b/,
];
const CHATTY = [
  /^(hi|hii+|hey+|hello|yo|sup|good (morning|afternoon|evening)|greetings)\b/,
  /^(ok|okay|k|kk|cool|nice|great|fine|sure|alright|right|yes|no|yeah|nah|done|next|continue|start|go)\b[.!]*$/,
  /^(thanks|thank you|ty|cheers|please|sorry)\b/,
  /^(test|testing|hmm+|erm|uh+|lol|haha)\b/,
  /^(this|that|it) (is|was|feels) (hard|difficult|confusing|easy|tricky|unclear)\b/,
  /^i (don'?t|do not) (get|understand) (this|it)\b/,
];
const MESSAGE = (kind: string, topic: string) => ({
  unchanged: "That's the original question, word for word. Change it first, then test it again.",
  repeat: "You've already tested that version. Change it, then test it again.",
  unreadable: "I can't read that as a question. Write it the way it would appear on an exam paper.",
  chatty: "Nothing to answer yet. Send me your redesigned question and I'll answer it the way a student's AI would.",
  asking: "I can't tell you what to write — that's the part you're practising. Send me your redesigned question and I'll answer it as it stands.",
  "off-topic": `That's moved away from ${topic}. Keep the question about ${topic}, then make it depend on your class.`,
}[kind]!);

export function intentCheck(text: string, o: { id: "market" | "noble"; label: string; original: string; tested: string[] }) {
  const t = lower(text), flat = bare(text);
  const v = (kind: string) => ({ kind, message: MESSAGE(kind, o.label.toLowerCase()) });
  if (!t) return v("unreadable");
  if (flat === bare(o.original)) return v("unchanged");
  if (o.tested.some((p) => bare(p) === flat)) return v("repeat");
  if (CHATTY.some((re) => re.test(t))) return v("chatty");
  if (ASKING.some((re) => re.test(t))) return v("asking");
  const words = t.match(/[a-z']{2,}/g) || [];
  const readable = words.filter((w) => /[aeiouy]/.test(w));
  if (words.length < 3 || readable.length < 2 || t.replace(/[^a-z ]/g, "").length < t.length * 0.55) return v("unreadable");
  if (!onTopic(text, o.id)) return v("off-topic");
  return null;
}
```

Aside replies render as a dashed, transparent reply card and think for 0.9s.

## 13. Fix assessment (unaided and practice)

Assessed silently on submit; shown only in the audit. The task asks for one short course-specific detail, not a full question.

```ts
export function evaluateFix(text: string): { quality: "course_specific" | "generic"; note: string } {
  const t = norm(text);
  const dataMatch = t.match(DATA_RE);
  const owned = OWN_RE.test(t) || CLASS_VERB_RE.test(t) || /\b(campus|our|class)\b/i.test(t);
  if (dataMatch && owned) return { quality: "course_specific", note: `Names ${withArticle(cleanNoun(dataMatch[1]))} only your class has, so AI couldn't answer without it.` };
  if (dataMatch) return { quality: "generic", note: `Any ${cleanNoun(dataMatch[1])} would do. Make it one only your class has.` };
  if (INFO_RE.test(t)) return { quality: "generic", note: "Notes and slides repeat general knowledge, so AI could still answer." };
  if (DECORATION_RE.test(t) || OWN_RE.test(t)) return { quality: "generic", note: "A week number or “as discussed” doesn't name any class material." };
  return { quality: "generic", note: "It doesn't name any class material, so AI could still answer." };
}
```

## 14. Optional: live AI in Lovable

The rubric checker is the default and must always work offline. If you add Lovable's AI connector:

- One protected backend function (e.g. `evaluate-redesign`). No keys or prompts in the browser.
- It must return the **same shape** as `evaluateRedesign`: `{ verdict, reason, note, reply, material }`, with `note` ≤ 15 words and `reply` ≤ 70 words, British English, and a reply that never invents the contents of the class material.
- Apply the same rubric as §11 in its instruction, and validate on return: accept `resilient` only if `material` is non-empty. On any error, timeout or contradiction, use the rule-based result. A service failure must never use a try or count as resilient.
- Learner text is data, never instructions. The fixed questions' replies, judgements, counts and stage changes stay in application code.

## 15. State, persistence and resume

```ts
type Stage = "intro" | "flip-ask" | "flip-judge" | "flip-done" | "redesign" | "redesign-done"
  | "cold-ask" | "cold-judge" | "cold-done" | "end" | "practice-ask" | "practice-judge" | "closed";

type Attempt = { text: string; verdict: Classification; reason: string; note: string; reply: string };
type UnaidedResult = {
  id: QuestionId; choice: Classification; fix: string | null; correct: boolean;
  fixQuality: "course_specific" | "generic" | "not_applicable"; fixNote: string; submittedAt: string;
};
type Session = {
  stage: Stage;
  flip: { index: number; asked: QuestionId[]; choices: Partial<Record<QuestionId, Classification>>; draft: Classification | null };
  redesign: {
    index: 0 | 1;
    drafts: Record<"market" | "noble", string>;          // seeded with the original questions
    attempts: Record<"market" | "noble", Attempt[]>;     // max 2 each
    status: Record<"market" | "noble", "pending" | "resilient" | "unresolved">;
  };
  asides: { qid: "market" | "noble"; after: number; prompt: string; message: string }[];
  cold: { asked: boolean; choice: Classification | null; fix: string; result: UnaidedResult | null };
  practice: { order: QuestionId[]; active: QuestionId | null; asked: boolean; choice: Classification | null; fix: string; results: UnaidedResult[] };
  complete: boolean;
};
```

- Save to `localStorage` (`spot-the-weak-question:v1`) after every change, including drafts. Wrap storage in try/catch; the run must work without it.
- On load, restore an unfinished session (rebuild the thread with no animation and scroll to the end); a returning learner skips the opener and video. A finished session starts fresh.
- Query flags: `?reset` (clear), `?skipintro`, `?nowalk`.
- Guards: a flip choice is stored once; the unaided result locks once; a practice item can't be submitted twice; Send/Confirm do nothing while Sage is thinking.
- The `result` posted on Finish contains: each flip choice and whether it was correct; each redesign's attempts (text, verdict, reason), final text and final status; the unaided result; practice results; completion.

## 16. Accessibility

- Real buttons; the judgement is a `role="radiogroup"` of `role="radio"` buttons with arrow-key movement and roving tabindex.
- Visible labels for the composer (sr-only label naming the question and "Two tries") and the fix field.
- `aria-live="polite"` announcements: Sage's reply, the verdict and note with tries left, Kemi's feedback, "Recorded…", "Finished…".
- Focus moves to the dock's main action after each stage change (not into textareas automatically, except the composer).
- Captions on by default for the video; mute available; no essential information is sound-only.
- Reduced motion: no clip playback (posters only), near-instant reveals, opener shows its final frame.
- Text contrast WCAG AA throughout (status colours were chosen for it). Minimum 62 canvas-px tap targets.

## 17. Assets (copy from the repository)

| Path in `spot-the-weak-question-chat/` | Use |
|---|---|
| `assets/logos/ekiti.svg`, `miva.svg`, `tof.svg`, `chevrons.svg` | Opener logos and chevron motif |
| `assets/miva-mark.png` | Top-bar brand mark |
| `assets/cast/sage-avatar.png` | Sage's avatar |
| `assets/cast/kemi-talk.png` | Kemi's avatar (crop to face: `object-position: 50% 12%`, `scale(1.6)`) |
| `assets/cast/{tade-puzzled,tade-walk,sage-think,kemi-talk,trio-wave,trio-cheer}.{webm,mov,png}` | Character clips: VP9-alpha `.webm`, HEVC-alpha `.mov` for Safari, `.png` posters for reduced motion. Play as `autoplay loop muted playsinline`, decorative (`aria-hidden`). |
| `assets/video/explainer.mp4`, `explainer.en.vtt` | Walkthrough video and captions (§8). Source project: `swq-explainer-video/`. |

Fonts: Afacad and Manrope (Google Fonts or self-hosted). Icons: `@phosphor-icons/web` 2.1.1 (regular, bold, fill).

## 18. Acceptance checklist

### Shell and layout
- [ ] One route; the thread only ever appends; the dock shows one action at a time.
- [ ] Uniform scaling: identical layout from 1024px to 3440px wide; nothing scrolls sideways; smallest text 12px at 1024.
- [ ] Afacad and Manrope load; status uses text + icon + colour.

### Opener and video
- [ ] Logos never overlap or fly; the row stays centred at every stage; Esc shows the finished frame.
- [ ] Begin → loader → video with sound and captions; Skip, Esc and mute work.
- [ ] From 29.2s a real Let's begin button sits exactly over the drawn one and has focus; it opens the conversation.
- [ ] A broken video falls back without a dead end. Returning learners skip both.

### Flip test
- [ ] Each question is sent from the ask card; Sage thinks, then replies.
- [ ] No option is preselected; both show definitions; Confirm stays disabled until a choice.
- [ ] Kemi's feedback names the right answer and why, for both correct and incorrect choices.
- [ ] After question 3 the learner moves on by pressing Redesign the weak ones.

### Redesign
- [ ] Market segmentation then noble gases, regardless of the learner's judgements; each seeded with its original.
- [ ] All 13 checker cases in §11 pass.
- [ ] Greetings, help requests, gibberish, the unchanged original, a repeat and an off-topic message get an aside and use no try.
- [ ] Two tries each; Resilient or two Still vulnerable tries closes the item; Next question / Continue advances.

### Unaided, audit and practice
- [ ] No feedback and no answer hints on the unaided question; the fix field appears only for Vulnerable and keeps its draft.
- [ ] The result locks on Submit; the fix is assessed silently.
- [ ] The audit shows real values for all three strands, the original-vs-final redesigns, the causal explanation and the fix assessment.
- [ ] Practice draws each bank item once, shows a Not scored card, and never changes the official result.
- [ ] Finish posts the completion message; Start again resets; refresh restores an unfinished run exactly.

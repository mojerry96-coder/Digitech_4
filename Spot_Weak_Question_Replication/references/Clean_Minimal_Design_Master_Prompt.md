# MASTER DESIGN PROMPT — CLEAN, MINIMAL, AI-NATIVE INTERACTIVE SIMULATIONS

Use this as the default design system and build instruction for future simulations, tools, learning experiences, and interactive interfaces that should feel premium, modern, minimal, and AI-native.

---

# 1. CORE DESIGN INTENT

Create an experience that feels like a **real product first** and an instructional simulation second.

The interface must feel:

- clean
- minimal
- premium
- calm
- intentional
- spacious
- modern
- AI-native
- highly usable
- visually focused
- interaction-led rather than text-led

Do not design it like:

- an LMS page
- a slide deck
- a dashboard with too many widgets
- a presentation page
- a course handout
- a heavily narrated screen
- a page filled with instructional copy

The learner should feel like they are **using a tool**, not reading a lesson.

---

# 2. THE MOST IMPORTANT RULE

## Show only what the learner needs right now.

Use **progressive disclosure**.

Do not place all instructions, options, hints, controls, outcomes, and explanations on screen at the same time.

At every state, ask:

> What is the single most important thing the learner needs to notice or do now?

Everything else should either:

- stay hidden
- appear only after interaction
- live in a secondary panel
- expand on demand
- appear contextually
- be represented visually instead of verbally

If two or more elements are fighting for attention, simplify the screen.

---

# 3. USE ONE PERSISTENT WORKSPACE WHEN POSSIBLE

Do not create a new page layout for every step unless the experience truly requires it.

Prefer:

> **one persistent interface with multiple states**

Keep the same:

- shell
- spacing system
- main content regions
- input style
- button style
- typography
- interaction area
- response area

Then change only:

- content
- visibility
- state
- status
- prompt
- output
- contextual tools
- action label
- theme emphasis

This creates continuity and makes the simulation feel like one coherent product.

---

# 4. WORKSPACE-FIRST STRUCTURE

A strong default layout is:

```text
┌────────────────────────────────────────────────────────────┐
│ subtle module / simulation identifier                      │
│                                                            │
│  PRIMARY WORK AREA              RESULT / RESPONSE AREA     │
│                                                            │
│  input / task / evidence        feedback / output / state  │
│                                                            │
│  contextual controls                    primary action     │
└────────────────────────────────────────────────────────────┘
```

Use two main working regions rather than many small cards.

Good:

- prompt editor + output
- evidence + decision
- task + response
- map + action tray
- source + analysis

Avoid:

- 6 equally weighted cards
- too many boxes
- excessive nested containers
- dashboard-style card grids unless the activity genuinely needs them

---

# 5. VISUAL HIERARCHY

The hierarchy should usually be:

1. current task / interaction
2. important working content
3. response or consequence
4. primary action
5. optional support
6. metadata

The simulation title should **not dominate every screen**.

Keep global titles small after the opening.

Do not repeat:

- product title
- simulation subtitle
- module title
- page title
- step title

at large scale simultaneously.

Use a restrained micro-header after the experience begins.

---

# 6. MINIMAL COPY

Reduce instructional text aggressively.

Prefer:

```text
Diagnose the Gap
Find what the prompt is missing.
```

instead of:

```text
A strong prompt has several important ingredients and in this
activity you will carefully review the prompt and AI reply to
determine which important elements have not been included.
```

Use:

- short labels
- fragments
- microcopy
- concise states
- tooltips
- contextual hints

Avoid paragraphs unless the content itself must be read.

---

# 7. VISUAL COMMUNICATION BEFORE EXPLANATION

Where an image can explain something better than text, use an image.

Where an icon can communicate something immediately, use an icon.

Where layout can show a relationship, do not explain that relationship in a paragraph.

Examples:

```text
🎯 Objectives
▤ Activities
▥ Assessment
▱ Resources
```

can replace repeated descriptive sentences when the purpose is simply to show generic response structure.

Use visual communication for:

- categories
- status
- sequence
- comparison
- hierarchy
- response quality
- object relationships
- progress

But icons must have meaning.

Do **not** use icons decoratively.

---

# 8. ICON RULES

Use one consistent icon family.

Icons should:

- replace text where possible
- support scanability
- clarify state
- identify function

Do not place an icon beside every sentence.

Recommended pattern:

```text
[icon] Label
       short sublabel
```

Good:

```text
Context
Who is this for?
```

Bad:

```text
[icon] Context [icon] audience [icon] learner [icon] setting
```

---

# 9. TYPOGRAPHY

Default system:

```css
--font-display: "Afacad", system-ui, sans-serif;
--font-body: "Manrope", system-ui, sans-serif;
```

Use Afacad for:

- page titles
- major state titles
- display text

Use Manrope for:

- body copy
- inputs
- labels
- buttons
- helper text
- UI states

Suggested type scale:

```css
:root {
  --text-xs: 12px;
  --text-sm: 14px;
  --text-md: 16px;
  --text-lg: 20px;
  --text-xl: 28px;

  --display-sm: clamp(42px, 4vw, 62px);
  --display-lg: clamp(54px, 5.4vw, 84px);
}
```

Use tighter letter spacing for display headings:

```css
.page-title {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 0.98;
}
```

Body:

```css
.body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
}
```

Avoid excessive bold text.

---

# 10. LIGHT / DARK RHYTHM

Use a controlled mix of light and dark states for emphasis.

Do not make every screen visually identical.

Dark states are useful for:

- opening moments
- consequence states
- major results
- transition moments
- final comparison
- high-emphasis decisions

Light states are useful for:

- active input
- editing
- diagnosis
- detailed work
- structured interaction

The light/dark change should feel like a **state shift inside the same product**, not a new website.

---

# 11. COLOUR DIRECTION

Use a restrained AI-native palette.

Suggested tokens:

```css
:root {
  --ink-950: #06101F;
  --ink-900: #091525;
  --ink-850: #0C1B30;

  --paper-000: #FFFFFF;
  --paper-025: #FBFDFF;
  --paper-050: #F6FAFF;

  --blue-700: #1158E8;
  --blue-600: #176BFF;
  --blue-500: #2688FF;

  --cyan-500: #20C6F4;
  --cyan-400: #43D9F7;

  --mint-100: #EAFBF5;
  --mint-500: #27C88A;
  --mint-700: #129767;

  --rose-100: #FFE9ED;
  --rose-500: #F35C73;
  --rose-700: #C9364D;

  --violet-100: #F0EBFF;
  --violet-500: #765AF8;

  --text-dark: #071127;
  --text-mid: #53617B;
  --text-soft: #7D899E;
  --text-on-dark: #F6FAFF;
  --text-on-dark-muted: #B5C2D6;
}
```

Primary action gradient:

```css
--gradient-cta:
  linear-gradient(
    100deg,
    #176BFF 0%,
    #2688FF 52%,
    #20D4F4 100%
  );
```

Dark shell:

```css
--gradient-dark-page:
  radial-gradient(
    circle at 88% 6%,
    rgba(57,153,255,.58),
    transparent 24%
  ),
  radial-gradient(
    circle at 4% 92%,
    rgba(0,208,255,.42),
    transparent 25%
  ),
  linear-gradient(
    135deg,
    #06101F 0%,
    #08172A 52%,
    #0C2440 100%
  );
```

Light shell:

```css
--gradient-light-page:
  radial-gradient(
    circle at 100% 0%,
    rgba(76,189,255,.30),
    transparent 24%
  ),
  radial-gradient(
    circle at 0% 100%,
    rgba(68,216,226,.22),
    transparent 27%
  ),
  linear-gradient(
    180deg,
    #FFFFFF 0%,
    #F7FBFF 100%
  );
```

---

# 12. SPACING SYSTEM

Use a strict spacing scale.

```css
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 40px;
--space-6: 48px;
--space-7: 56px;
--space-8: 64px;
--space-10: 80px;
--space-12: 96px;
```

Recommended spacing:

```text
Page edge padding        48–88px
Title → support line     16–24px
Support → workspace      36–48px
Label → input            12–16px
Input → next block       28–36px
Card inner padding       28–40px
Main column gap          28–48px
```

Do not fill empty space unnecessarily.

Whitespace is part of the design.

---

# 13. GRID

Use a 12-column grid.

```css
.page-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(20px, 1.7vw, 32px);
  max-width: 1540px;
  margin: 0 auto;
}
```

Common layout:

```text
Left workspace   6 columns
Right response   6 columns
```

Or:

```text
Task area        5 columns
Response area    7 columns
```

Avoid unnecessary sidebars.

---

# 14. CARDS AND SURFACES

Use large, clean surfaces instead of many small cards.

Light surface:

```css
.surface-light {
  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,.98),
      rgba(238,247,255,.90)
    );

  border: 1px solid rgba(74,139,218,.18);
  border-radius: 28px;

  box-shadow:
    0 24px 70px rgba(22,77,135,.10),
    inset 0 1px 0 rgba(255,255,255,.95);

  backdrop-filter: blur(16px);
}
```

Dark surface:

```css
.surface-dark {
  background:
    linear-gradient(
      145deg,
      rgba(16,39,69,.88),
      rgba(8,24,45,.88)
    );

  border: 1px solid rgba(74,185,255,.38);
  border-radius: 28px;

  box-shadow:
    0 22px 65px rgba(0,0,0,.34),
    0 0 38px rgba(31,144,255,.12);

  backdrop-filter: blur(18px);
}
```

Avoid:

- excessive borders
- thick outlines
- multiple nested containers
- overly glassy everything
- huge shadows
- strong gradients on every card

---

# 15. INPUT DESIGN

Inputs should feel like premium product controls.

```css
.prompt-input,
.prompt-textarea {
  width: 100%;
  background: rgba(255,255,255,.86);

  border:
    1px solid rgba(46,111,191,.22);

  border-radius: 20px;

  padding: 22px 26px;

  font-family: var(--font-body);
  font-size: 20px;
  line-height: 1.5;

  color: var(--text-dark);

  outline: none;

  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.prompt-textarea {
  min-height: 170px;
  resize: none;
}

.prompt-input:focus,
.prompt-textarea:focus {
  border-color: rgba(38,136,255,.75);

  box-shadow:
    0 0 0 4px rgba(38,136,255,.10),
    0 8px 28px rgba(34,117,222,.08);
}
```

Important:

Do not automatically fill input fields with a completed answer.

If a task requires editing an existing weak input, seed only the **original weak input**.

If the learner must generate a solution independently, the field must start empty or contain only the original material being revised.

Never give away the answer inside the input.

---

# 16. PRIMARY ACTIONS

Use only one visually dominant CTA at a time.

```css
.primary-cta {
  min-height: 58px;
  padding: 0 34px;

  border: 0;
  border-radius: 999px;

  color: white;

  background:
    linear-gradient(
      100deg,
      #176BFF 0%,
      #2688FF 52%,
      #20D4F4 100%
    );

  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 650;

  box-shadow:
    0 14px 32px rgba(23,107,255,.25),
    0 0 24px rgba(32,198,244,.14);

  cursor: pointer;
}
```

Hover:

```css
.primary-cta:hover {
  transform: translateY(-2px);
}
```

Do not place multiple primary CTAs on one state.

---

# 17. STATE-BASED DESIGN

Each state should change only what needs to change.

Example:

```ts
type ViewState =
  | "intro"
  | "diagnose"
  | "diagnosisResult"
  | "revise"
  | "strongResult"
  | "coldTransfer"
  | "summary";
```

Persist:

```ts
type AppState = {
  currentView: ViewState;
  userInput: string;
  attemptsUsed: number;
  selections: Record<string, string | null>;
  resultTier: string | null;
  history: Array<any>;
};
```

The UI shell remains stable.

---

# 18. OPENING WALKTHROUGH

If the simulation has an unfamiliar interaction model, use a short walkthrough video before the learner begins.

Recommended:

```text
15–25 seconds
```

Purpose:

- show what the learner will do
- show the interaction rhythm
- reduce instructional text later

The walkthrough should visually demonstrate:

1. inspect
2. choose / diagnose
3. revise
4. test
5. see result

Use minimal voice or captions.

Avoid turning it into a long instructional lecture.

The walkthrough should reduce future UI copy, not add another layer of explanation.

---

# 19. ANIMATION PRINCIPLES

Nothing should appear abruptly.

Use:

- fade
- slight rise
- crossfade
- subtle scale
- stagger
- glow shift

Avoid:

- bounce
- excessive zoom
- dramatic wipes
- constant movement
- distracting particles
- over-animated backgrounds

Recommended easing:

```ts
const ease = [0.22, 1, 0.36, 1];
```

Default entrance:

```ts
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.5,
      ease
    }
  }
};
```

Card entrance:

```ts
const cardIn = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.985
  },

  show: {
    opacity: 1,
    y: 0,
    scale: 1,

    transition: {
      duration: 0.58,
      ease
    }
  }
};
```

Stagger:

```ts
const stagger = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.075
    }
  }
};
```

---

# 20. MOTION HIERARCHY

Animate in this order:

```text
1. environment
2. current state title
3. primary working panel
4. secondary response panel
5. contextual controls
6. main CTA
```

Do not animate everything simultaneously.

---

# 21. FEEDBACK STATES

Feedback should feel calm and informative.

Weak:

```text
Weak reply
Still too vague.
```

Getting there:

```text
Getting there
One important piece is still missing.
```

Strong:

```text
Strong reply
Clear, structured, ready to use.
```

Use colour + text + icon.

Never rely on colour alone.

Avoid gamified celebration unless the product explicitly needs it.

No confetti by default.

---

# 22. HINTS AND SUPPORT

Hints must be contextual.

Do not keep all hints visible.

Better:

```text
Need a hint?
```

Click → small drawer / popover.

Or show quiet helper chips only during scaffolded states.

Remove all scaffolding in transfer / mastery states.

---

# 23. PROGRESSIVE REDUCTION OF SUPPORT

A strong learning experience should gradually remove help.

Example:

```text
State 1 — orientation
State 2 — full scaffolding
State 3 — explained feedback
State 4 — light support
State 5 — success state
State 6 — no hints
State 7 — summary
```

The UI should visually reflect this reduction.

---

# 24. KEEP INTERACTIONS CLOSE TO THEIR CONSEQUENCES

If a learner edits something on the left, show the resulting change on the right.

Avoid sending the learner to a new page just to see feedback.

Prefer:

```text
input → action → result update
```

inside the same workspace.

---

# 25. DO NOT REPEAT INFORMATION

If something is already visible, do not explain it again.

Bad:

```text
Prompt field: Write a lesson plan.

Below:
This prompt says “Write a lesson plan.”
```

Good:

```text
Write a lesson plan.

What is missing?
```

---

# 26. DARK PAGE USAGE

Use dark layouts for emphasis, not constantly.

Strong use cases:

- opening
- reveal
- outcome
- consequence
- summary
- major transition

Keep white/light working panels inside dark states where needed for readability.

---

# 27. LIGHT PAGE USAGE

Use light layouts for focused work.

Strong use cases:

- input
- editing
- selection
- diagnosis
- comparison
- data manipulation
- form-like interactions

Light states should still feel premium through:

- large whitespace
- faint blue/cyan glow
- subtle borders
- restrained surfaces

---

# 28. RESPONSIVENESS

Desktop first.

Standard target:

```text
16:9
1920×1080 reference frame
```

Do not require vertical scrolling on standard desktop unless the activity truly needs it.

Minimum touch target:

```css
min-width: 44px;
min-height: 44px;
```

Tablet:

- reduce display title size
- compress spacing
- retain working relationship between panels

Mobile:

- stack working areas vertically
- keep CTA visible
- preserve interaction order

---

# 29. ACCESSIBILITY

Required:

- keyboard access
- clear focus states
- semantic buttons
- labelled inputs
- aria-live for dynamic results
- colour-independent status
- reduced motion
- sufficient contrast
- no hidden answer clues in accessible labels
- no timed interaction pressure unless pedagogically necessary

Example:

```tsx
<div aria-live="polite">
  {statusMessage}
</div>
```

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 30. DESIGN QA QUESTIONS

Before finalising any state, ask:

```text
1. What is the learner supposed to do here?
2. Is that action immediately obvious?
3. Is anything competing with it?
4. Can any text be removed?
5. Can an icon or image communicate something faster?
6. Can any panel be removed?
7. Is the main CTA obvious?
8. Is there more than one primary action?
9. Does this feel like a product or a guide page?
10. Is the screen visually calm?
11. Is the title too dominant?
12. Does the learner see only what they need now?
13. Does feedback appear close to the action?
14. Is support removed when it should be?
15. Does the state fit inside the viewport?
```

If the design feels like a presentation slide, redesign it.

---

# 31. COMMON FAILURE MODES TO AVOID

Do not:

- add unnecessary icons
- add decorative illustrations without purpose
- create huge title blocks
- repeat the simulation title at large scale
- add seven page indicators for seven visual states
- make every state look like a separate page
- prefill answers
- reveal correctness before commitment
- use too many cards
- create persistent hints
- add extra CTAs
- overuse glassmorphism
- use long paragraphs
- over-explain obvious interactions
- show all metadata at once
- fill empty space just because it exists

---

# 32. THE MASTER DESIGN RULE

The experience should always feel like:

> **one intelligent workspace responding to the learner**

not:

> **a collection of instructional pages explaining what the learner should do**

---

# 33. FINAL MASTER PROMPT

```text
Design this simulation as a premium, minimal, AI-native interactive product.

Use one persistent workspace wherever possible, with multiple visual states rather
than separate page layouts.

Prioritise the current task over global titles, navigation, or instructional copy.

Use Afacad for display typography and Manrope for body/UI.

Keep copy extremely concise.

Where an image can explain something, use an image.
Where an icon can replace explanatory copy, use a purposeful icon.
Do not use decorative iconography.

Use a controlled mix of dark and light states to create emphasis and rhythm.
Dark states should feel cinematic and high-value.
Light states should feel focused, functional, and spacious.

Use deep navy/near-black backgrounds, white working surfaces, restrained
blue/cyan gradients, soft glow, subtle mint success states, and soft rose
warning states.

Use large whitespace and a strict 8px spacing system.

Avoid dashboard clutter.
Avoid excessive cards.
Avoid persistent navigation.
Avoid page-number steppers.
Avoid large blocks of text.
Avoid guide-page layouts.
Avoid prefilled answers.
Avoid multiple primary actions.

Use one dominant CTA per state.

Keep interactions close to their consequences.
Inputs should update visible outputs in the same workspace.

Use progressive disclosure:
show only what the learner needs now,
reveal supporting information contextually,
and remove scaffolding as learner independence increases.

Use smooth restrained animation:
fade, rise, crossfade, stagger, and subtle glow changes.
Never use excessive bounce, confetti, or distracting motion.

If the learner must edit a weak input, seed only the original weak input.
Never place the finished solution inside an input field before the learner acts.

If the product needs orientation, use a short 15–25 second walkthrough video
before play instead of adding large amounts of instructional text to every state.

All screens should feel like a coherent product.
The learner should feel they are using an intelligent tool,
not reading a course slide.
```

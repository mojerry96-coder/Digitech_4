---
format: 1920x1080
duration: 30s
message: "Run the flip test, judge it, then redesign weak questions so they need your class."
arc: Title → Ask like a student → Instant answer → Judge it → Verdict → Redesign → AI can't answer → Let's begin
audience: "EKSU lecturers, AI Literacy Unit 2.4"
mode: collaborative
---

# Spot the Weak Question — explainer storyboard (v2)

**Message:** If AI can answer your question without your course, so can a student; make it need your class.
**Audience and arc:** lecturers about to start the simulation. Ask → answer → judge → redesign → resolve, then begin.
**Format:** 1920×1080, 30.0s, silent (no voiceover, no music). Headlines carry the teaching; each holds ≥0.8s readable.
**The spine:** one floating chat window (the simulation's own UI) that the camera moves around. One prop rides the whole film: the question card, which becomes the user bubble, the composer and finally the "Resilient" badge that morphs into the end-card button.
**Brand:** `frame.md` (captured from the simulation's CSS and the brand deck).
**Truthfulness:** the window, bubbles, judgement cards, composer and badges are the simulation's real UI, rebuilt as layers from its stylesheet. The demo question and replies are illustrative and never the assessed ones.
**Bans:** no slideshow (no beat may arrive as a fresh unrelated card; every seam hands off a shared object), no screensaver motion (every move carries the story), no gradient text, no glow on type, no assessed questions, no sound.
**Held frame:** Frame 06, the verdict line "Instant answer = weak question" holds still for 0.9s.
**Direction rule:** the camera always travels left-and-up into the next beat; exits leave right/down.

## Changes from v1

- User: "use the fonts manrope and afacad" — confirmed; both bundled locally and verified loading.
- User: "push closer on 06 and 08" — camera now settles close on the thread in both (window 1620 wide, tilt −5°/2°), UI type 34–42px instead of 26–30px.

## Locked

- Layout of all nine frames as drawn on `storyboard.html` v2, with copy, placement and hierarchy.
- Fonts: Afacad (display) and Manrope (UI). Palette and easing per `frame.md`.
- Duration 30.0s, silent, 1920×1080.

Beat total: 2.3 + 1.7 + 3.0 + 2.6 + 3.0 + 2.8 + 5.0 + 4.6 + 5.0 = **30.0s**.

## Frame 1 — Title

- scene: "The flip test" blurs in and out; then "Spot the" and "Question" arrive with a gap, and "Weak" lands last in the gap on an amber block
- duration: 2.3s
- poster: 1.9s
- transition_in: cut
- status: animated
- voiceover: onscreen
- src: index.html
- start: 0.0
- motion: kinetic-type-beats (rules: soft-blur-in, spring-pop-entrance)
- seam_out: fly-through — lockup scales 100→115%, blurs to 25px, fades (emphasized-accel, 0.4s); overlaps the window rise by 0.1s

Opens on the name with the key word arriving last, so the title builds anticipation (breakdown Beat 1). "Weak" sits on an amber block with brown text, which is the brand's action colour. Constraint: no logo wall, no subtitle paragraph.

## Frame 2 — Window rise

- scene: The simulation's chat window rises from bottom-right, defocused, and settles into its 3D pose; the composer holds "Define opportunity cost."
- duration: 1.7s
- poster: 1.5s
- transition_in: cross-blur
- status: animated
- voiceover: onscreen
- src: index.html
- start: 2.3
- motion: device-surface-showcase (rules: 3d-camera-flight, depth-of-field-blur)
- seam_out: defocus hand-off — the window blurs out behind the composer card, which stays sharp (anchor)

Reveal the product (breakdown Beat 2 / T7). The window reads as the real simulation: top bar "Spot the Weak Question", MIVA mark, empty thread, composer at the bottom. Constraint: no device frame or browser chrome.

## Frame 3 — Ask like a student

- scene: Headline "Ask it like a student would" builds word by word over the sharp composer card; the hand cursor arrives and clicks "Ask AI" with a ripple
- duration: 3.0s
- poster: 2.6s
- transition_in: defocus
- status: animated
- voiceover: onscreen
- src: index.html
- start: 4.0
- motion: cursor-ui-demo (rules: soft-blur-in, cursor-click-ripple, depth-of-field-blur)
- seam_out: shape morph — the composer card shrinks and re-radiuses into the cream user bubble as the window refocuses (card-morph-anchor, standard, 0.45s)

The flip test, stated as the action (breakdown Beat 3). Key words "like a student" in accent blue. Constraint: the cursor leaves before the headline holds; never competes with text.

## Frame 4 — Sage answers

- scene: Camera pushes toward Sage's avatar; a thinking shimmer bar fills; then the white reply card lands: "Opportunity cost is the value of the next best alternative you give up when you make a choice."
- duration: 2.6s
- poster: 2.2s
- transition_in: shape-morph
- status: animated
- voiceover: onscreen
- src: index.html
- start: 7.0
- motion: agent-progress-theater (rules: viewport-change, stat-bars-and-fills, soft-blur-in)
- seam_out: the reply card stays sharp as the judgement panel rises beneath it (anchor)

System feedback turned into the satisfying moment (breakdown Beat 4): the push-in on the "thinking" bar, which completes and retracts as the reply lands. The point: AI answered instantly and completely. Constraint: no spinner, no fake loading delay longer than 0.8s.

## Frame 5 — Judge it

- scene: Headline "Judge it." The two judgement cards slide up: "Vulnerable — AI can answer it without anything from your course." / "Resilient — AI can't answer it without something only your class has." Cursor picks Vulnerable; the radio dot swells
- duration: 3.0s
- poster: 2.5s
- transition_in: anchor
- status: animated
- voiceover: onscreen
- src: index.html
- start: 9.6
- motion: cursor-ui-demo (rules: cursor-click-ripple, spring-pop-entrance, soft-blur-in)
- seam_out: zoom-through — the selected radio dot pops (80→110%), then the camera rushes into it (scale 100→300%, emphasized-accel), whites out and reveals Frame 6 inside it

The definitions teach the two words (the confusion we fixed in the simulation). Constraint: both cards equal weight until the click; no correctness colour before the choice.

## Frame 6 — The verdict (held frame)

- scene: Kemi's feedback card assembles in the thread: "Yes, vulnerable. AI answered without knowing anything about your course." The camera settles close on the thread with a slight tilt (−5°), UI type ~40px. Headline "Instant answer = weak question" lands and holds
- duration: 2.8s
- poster: 2.4s
- transition_in: zoom-through
- status: animated
- voiceover: onscreen
- src: index.html
- start: 12.6
- motion: kinetic-type-beats (rules: soft-blur-in, 3d-camera-flight, multi-phase-camera)
- seam_out: camera push toward the composer (viewport-change, emphasized-decel, 0.6s)

The rule of thumb, stated plainly and held still for 0.9s. Key words "weak question" in accent blue. Constraint: nothing else moves during the hold except the camera's 1.00→1.02 drift.

## Frame 7 — Make it need your class

- scene: Close on the composer. "Define opportunity cost." is selected and retyped as "Using the price data from our week-two market survey, what was the stall's opportunity cost?" Headline "Make it need your class". Two try dots, one fills on send
- duration: 5.0s
- poster: 4.2s
- transition_in: camera-push
- status: animated
- voiceover: onscreen
- src: index.html
- start: 15.4
- motion: prompt-type-submit-generate (rules: discrete-text-sequence, soft-blur-in, cursor-click-ripple)
- seam_out: shape morph — the composer collapses into a new user bubble (card-morph-anchor), camera pulls back to the thread

The redesign move (breakdown Beat 7). Typing at ~18 chars/s with a blinking caret. Key words "your class" in accent blue. Constraint: no autocomplete, no suggestion chips.

## Frame 8 — Now AI can't

- scene: Sage replies: "I don't have the data from your week two session, so I can't answer this properly." The camera sits close on the thread (UI type ~40px); the "Resilient" badge pops in (90→100%). Headline "Now AI can't answer it". The window dissolves, leaving only the badge centred
- duration: 4.6s
- poster: 3.4s
- transition_in: shape-morph
- status: animated
- voiceover: onscreen
- src: index.html
- start: 20.4
- motion: camera-journey (rules: spring-pop-entrance, depth-of-field-blur, soft-blur-in)
- seam_out: isolation — everything except the Resilient badge blurs and fades (T2); the badge holds alone on the ground

The payoff (breakdown Beat 8): the same tool now has nothing to give a student. Key word "can't" in accent blue. Constraint: the badge is the only object left; no confetti.

## Frame 9 — Let's begin

- scene: The Resilient badge grows, its fill sweeps from mint to accent blue, and it morphs into the "Let's begin" pill. Above it: the MIVA mark and "Spot the Weak Question". Below: "3 questions to test · 2 to redesign · 1 on your own"
- duration: 5.0s
- poster: 3.5s
- transition_in: shape-morph
- status: animated
- voiceover: onscreen
- src: index.html
- start: 25.0
- motion: cta-morph-press (rules: card-morph-anchor, soft-blur-in, mesh-gradient-bg)
- seam_out: end — holds 1.5s with slow push-in and drifting blooms

The resolve (breakdown Beat 9): the result of the redesign becomes the way in. The plan line replaces the walkthrough's old "what you'll do" scene. Constraint: no static end card; the push-in and blooms keep moving.

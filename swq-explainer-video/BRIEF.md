---
workflow: general-video
flow: automation
storyboard: yes
message: "Run the flip test, judge it, then redesign weak questions so they need your class."
destination: in-app walkthrough
aspect: 1920x1080
language: en-GB
audience: "EKSU lecturers, AI Literacy for Teaching and Research, Unit 2.4"
length: 37s
angle: product-ui-explainer
---

## Intent

A voiced motion-graphics UI explainer that replaces the captioned walkthrough in the
Spot the Weak Question simulation (`../spot-the-weak-question-chat`). It plays once after
the logo opener and ends on a "Let's begin" end card. On-screen headlines carry the
teaching: ask AI the question the way a student would, judge it vulnerable or resilient,
then redesign the weak ones so they depend on something only your class has.

## Assets

- ../spot-the-weak-question-chat/assets/cast/ — Sage avatar and character clips (sage-think, trio-cheer, kemi-talk); reuse, no new generations.
- ../spot-the-weak-question-chat/assets/miva-mark.png — MIVA mark for the end card.
- ../spot-the-weak-question-chat/styles.css — the real chat UI tokens (bubbles, reply cards, judge cards, composer, badges) to rebuild as layers.

## Customizations

- Motion language from `/Users/mosesjeremiah/Downloads/motion-graphics-breakdown.md`: 9-beat skeleton, blur-in/out (T1), defocus hand-off (T2), anchor objects (T3), shape morphs (T4), zoom-through (T5), camera push (T6), 3D window settle (T7), ripple (T8), word-by-word headlines (T9), Material emphasized easing, oversized cursor with curved paths, drifting corner blooms on an off-white ground.
- Fonts confirmed by the user: Afacad (headlines, title) and Manrope (all UI text), bundled locally in `assets/fonts/`.
- Swap the reference's Google palette for MIVA: navy #09314F, amber #EE9B01, cream #FCEBCC, accent blue #1D5BD6, mint/rose for status. Afacad headlines, Manrope UI.

## Notes

- Demo content only: "Define opportunity cost." Never show the assessed questions or their answers.
- Voiceover (user, at render: "render it and put it in the simulation with the voice over"): Ifeoma Odumodu - Nigerian Narrator, ElevenLabs eleven_multilingual_v2, the same voice as Fix the Prompt. Nine lines in `assets/vo/`; the film was retimed to the voice (30s → 36.9s) via a piecewise time-remap. No music or SFX.
- British English throughout.

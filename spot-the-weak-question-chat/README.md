# Spot the Weak Question

An interactive simulation for **Module 2 — AI Literacy for Teaching and Research, Unit 2.4**. Lecturers run the flip test on exam questions (ask AI the question the way a student would), judge whether each one is vulnerable or resilient, redesign the weak ones so they depend on something only their class has, then try one more on their own.

It's built on the **Fix the Prompt** engine (`~/digitech 2/fix-the-prompt`): one conversation with Sage (the AI), one dock where the learner acts, and Kemi giving feedback. It's a static web page with no build step and no server-side code.

## Run it locally

```bash
python3 -m http.server 5392 --directory spot-the-weak-question-chat
```

Then open <http://localhost:5392>. Add `?reset` to clear saved progress, `?skipintro` to skip the opener, or `?nowalk` to skip the walkthrough.

## Flow

1. **Opener:** the three partner logos line up, then "Spot the Weak Question" and **Begin**.
2. **Walkthrough video** (36.9s, voiced, captions on by default): the motion-graphics explainer built in `../swq-explainer-video` and rendered to `assets/video/explainer.mp4`, narrated by Ifeoma Odumodu (the Fix the Prompt voice). It uses a demo question, "Define opportunity cost.", so it never gives away an assessed answer. The learner can skip it, mute it, or replay it from the top bar. When the video reaches its end card, a real **Let's begin** button sits exactly over the drawn one. If the video can't play, the older scripted, captioned walkthrough runs instead.
3. **Run the flip test:** three questions. The learner sends each one to Sage, judges it Vulnerable or Resilient (both options show what the word means), and Kemi says whether they were right and why.
4. **Redesign and retest:** market segmentation, then noble gases, with two tries each. The composer starts with the weak question. Sage answers each redesign and labels it **Resilient** or **Still vulnerable**, with a one-line reason.
5. **One more, unaided:** "Explain the water cycle." The learner judges it, and if they choose Vulnerable, writes a course-specific fix. There's no feedback here; the result is locked and explained in the audit.
6. **Your question audit:** the three strands (flip test, redesign, unaided), each original next to the final version, and the reasons.
7. **Practice again** (optional): two bank questions, each used once. They're marked "Not scored" and never change the official result.

Progress is saved to `localStorage` after every step, so a learner who reloads carries on where they left off. When embedded, **Finish** posts `{ type: "spot-the-weak-question:complete", result }` to the parent window.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page shell. Bump `?v=` on the asset links after changing files. |
| `app.js` | The simulation: one state object, with the conversation built from it. |
| `content.js` | Questions, Sage's prepared replies, Kemi's feedback, answer keys. |
| `evaluator.js` | Rule-based checker (no live AI). Judges redesigns and unaided fixes. |
| `intent.js` | Catches messages that aren't a redesign (greetings, help requests, gibberish, the unchanged original, a repeat, a different subject). Sage answers in character and no try is used. |
| `walkthrough.js` | Loading screen, the explainer video player, and the scripted walkthrough used as a fallback. |
| `assets/video/` | `explainer.mp4` (rendered from `../swq-explainer-video`) and `explainer.en.vtt` captions. |
| `characters.js` | Inserts the character clips (from Fix the Prompt; no new generations). |
| `intro.js`, `intro.css` | The opener. |
| `zoom.js` | Keeps browser zoom working under uniform scaling. |
| `styles.css` | Everything else, sized in canvas units. |

## How the checker decides

A redesign is **Resilient** only when all of these hold:

- It still asks about the original topic. If not, Sage asks the learner to stay on topic and no try is used.
- It names material the class produced or examined: a case study, dataset, lab or practical results, survey responses, a primary source, a field trip, and similar.
- That material belongs to this class ("our", "we recorded", "week three", etc.).
- It's used for a real task, not as decoration on a definition ("Using the case study…, define market segmentation" stays vulnerable).

Everything else stays **Still vulnerable**, with a specific reason: generic rewording, a week label alone, notes or slides (which repeat general knowledge), or "a case study" that could be any case study. Run `node -e 'require("./evaluator.js")'` to load it in Node for quick checks.

In Lovable, `evaluator.js` can be swapped for a live AI call that keeps the same output shape: `{ verdict, reason, note, reply }` for a redesign and `{ quality, note }` for a fix.

## Layout

This uses the uniform scaling system in `../LAYOUT-SYSTEM.md`: a 1440px canvas, where every size is `calc(N * var(--px))`. The chat column is 760 canvas px and the smallest text is 17 canvas px (12px on a 1024px tablet). Content stops growing at 1.6×.

## Known limitations

- Browser-zoom tracking relies on `devicePixelRatio`, which Safari doesn't change on zoom.
- Safari should play the HEVC-with-alpha `.mov` character clips, but transparency there hasn't been checked yet (same as Fix the Prompt).

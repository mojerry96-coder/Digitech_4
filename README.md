# Digitech 4 — Spot the Weak Question

AI Literacy for Teaching and Research · Unit 2.4 (MIVA Open University / Digi-Teach).
Lecturers practise the **flip test**: ask AI an exam question the way a student would, judge whether it's vulnerable or resilient, and redesign weak questions so they depend on something only their class has.

## What's here

| Folder | What it is |
| --- | --- |
| [`spot-the-weak-question-chat/`](spot-the-weak-question-chat/) | **The simulation (current).** A chat-style build on the Fix the Prompt engine: opener, voiced explainer video, flip test with feedback, redesign with a rule-based checker, an unaided question, and the audit. Static site, no build step. |
| [`swq-explainer-video/`](swq-explainer-video/) | The HyperFrames project for the 36.9s motion-graphics explainer that opens the simulation (storyboard, design spec, voiceover, composition). |
| [`spot-the-weak-question/`](spot-the-weak-question/) | The earlier two-column React/Vite build, kept for reference. |
| [`Spot_Weak_Question_Replication/`](Spot_Weak_Question_Replication/) | The original replication prompt, storyboard and reference screens. |
| [`opener/`](opener/) | The MIVA logo opener specification and assets. |
| [`LAYOUT-SYSTEM.md`](LAYOUT-SYSTEM.md) | The uniform scaling layout system (1440px canvas) both builds use. |

## Run the simulation

```bash
python3 -m http.server 5392 --directory spot-the-weak-question-chat
```

Then open <http://localhost:5392>. Add `?reset` to clear saved progress, `?skipintro` to skip the opener, or `?nowalk` to skip the explainer video.

## Re-render the explainer

```bash
cd swq-explainer-video
npx hyperframes render -o renders/explainer.mp4 --quality delivery
cp renders/explainer.mp4 ../spot-the-weak-question-chat/assets/video/explainer.mp4
```

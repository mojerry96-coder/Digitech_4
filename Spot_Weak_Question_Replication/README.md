# Spot the Weak Question — replication package

This package describes **one single-page simulation with five main states**. The images are visual references for those states, not five separate web pages.

## How to use

1. Open `Spot_Weak_Question_Replication_Prompt.md` and paste its contents into Lovable as the implementation prompt.
2. Attach the five PNG files in `screens/` as visual references. Attach the two source documents in `references/` if needed for background.
3. Follow the consolidated prompt when an older source or screenshot differs from it. In particular, preserve the open layout and flat-colour buttons.
4. Implement and verify the states and behaviours using the acceptance checklist at the end of the prompt.

The Markdown includes CSS, a React/TypeScript cover component, content configuration, state and evidence types, guarded transition functions, and the backend AI evaluator contract. These are reference code to integrate into the app; this ZIP is not a finished runnable application.

## Included instances

| File | Instance illustrated |
|---|---|
| `screens/01_Cover_Open_Layout.png` | Opening title and Start action |
| `screens/02_Flip_Test_Reply_And_Choice.png` | Prepared AI reply and learner judgement |
| `screens/03_Redesign_Original_Question.png` | Editable original question before a retest |
| `screens/04_Unaided_Reply_And_Empty_Fix.png` | Independent challenge with an empty course-specific fix |
| `screens/05_Audit_Redesign_Detail.png` | Final evidence audit with redesign detail selected |

The prompt also specifies initial, loading, selection, retry, result, pending assessment, completion and optional practice instances that do not have separate PNGs. The reference images are 1672 × 941; the responsive desktop design target is 1920 × 1080.

## Cover motion graphic

The future cover background is a silent, seamless, looping motion-graphic playthrough of the simulation and its features. The real title and Start button remain interactive foreground UI. The prompt includes the motion sequence, safe example content, playback behaviour, accessibility controls, fallback and integration code.

**No video has been generated or included.** Media production is a separate future task; do not start Higgsfield generation from this package. The current cover PNG is a layout reference, and its paper artwork will give way to the future background animation.

## Source documents

- `references/Original_Storyboard.pdf` — original learning storyboard.
- `references/Clean_Minimal_Design_Master_Prompt.md` — visual design master prompt.

The consolidated prompt records the latest decisions and explicitly resolves source ambiguities. Screenshot scores are examples; the implementation must calculate audit evidence from the learner's actual work.

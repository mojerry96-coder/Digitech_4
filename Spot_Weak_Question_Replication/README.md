# Spot the Weak Question — replication package (v2.0, chat version)

This package describes **one single-page, chat-style simulation**: one conversation with Sage (the AI), one action dock, and Kemi's feedback. It replaces v1.0's open two-region layout, which learners found confusing. v1.0 remains in git history.

## How to use in Lovable

1. Paste `Spot_Weak_Question_Replication_Prompt.md` into Lovable as the build prompt.
2. Attach the ten PNGs in `screens-chat/` as visual references.
3. Upload the assets listed in §17 of the prompt from `../spot-the-weak-question-chat/assets/` (logos, characters, MIVA mark, and the explainer video + captions).
4. Build, then verify against the acceptance checklist in §18, including the 13 checker cases in §11.

The working reference build is `../spot-the-weak-question-chat/` (vanilla JS). The prompt is the authority where they differ.

## Reference screens (`screens-chat/`, 1440×810)

| File | State |
|---|---|
| `01_Opener.png` | Logo opener, finished frame |
| `02_Question_Stack.png` | First conversation state, Start the audit |
| `03_Flip_Test_Judgement.png` | Sage replied; judgement chosen |
| `04_Feedback_Next_Question.png` | Kemi's feedback; next question ready |
| `05_Redesign_Still_Vulnerable.png` | Week-label redesign: Still vulnerable, 1 try left |
| `06_Redesign_Resilient.png` | Case-study redesign: Resilient |
| `07_Unaided_Judgement_And_Fix.png` | Unaided question with a course-specific fix |
| `08_Audit_Top.png` | Audit card: headline and flip-test strand |
| `09_Audit_Redesign_And_Unaided.png` | Audit card: redesign and unaided strands |
| `10_Practice_Result.png` | Optional practice result, not scored |

Scores in the screens come from real test choices, not fixed values; the build must calculate them from the learner's own work.

## Other files

- `screens/` — v1.0 reference images (superseded; kept for history).
- `references/Original_Storyboard.pdf` — the learning storyboard (intent only).
- `references/Clean_Minimal_Design_Master_Prompt.md` — the earlier design master prompt (superseded by the prompt's §5–§6).
- The explainer video's source project is `../swq-explainer-video/`.

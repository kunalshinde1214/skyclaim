# Hackathon preparation and demonstration plan

Verified 19 October 2026 against the [event overview](https://learn-ai-basics.devpost.com/)
and [official rules](https://learn-ai-basics.devpost.com/rules). This is a preparation
report, not a submitted entry or learner-authored submission text.

## Verified event facts

Build With AI: Basics is organised by Devpost. Submissions run from 22 September
through 26 October 2026, 17:00 EDT: **27 October, 02:30 IST**. The overview lists
Design, Innovation/Idea and Presentation; the rules describe equal weighting.
The required deliverables include a public source repository, scope.md/prd.md/spec.md,
a working demo video under three minutes, and the entry's text fields. The overview
suggests a 1–3 minute recording. Aim for about two minutes. Eligibility restrictions,
originality, authorised third-party use and licensing must be checked in the rules.
More than one entry is allowed only if entries are substantially different.

The optional Will It Ship review is 22 October, 15:00 Eastern: **23 October,
00:30 IST**. Early sharing can seek feedback; it is not a substitute for the entry.
The event's public overview lists a USD2,500 prize pool, not a guaranteed outcome.

## The important curriculum/provenance gap

The required [Devpost Learn skill pack](https://github.com/challengepost/learn-ai-basics)
was inspected from commit a0f065781873e8a7ed9a9a705a8dafa6a0810439 on 19 October.
The reviewed copy is in the ignored artifacts/devpost-learn directory. Its actual
process asks for learner-led planning, review, a working build, a learning wrap-up
and personal authorship of entry answers. It is not identical to the older BMAD
reference pack or the new reusable idea-to-product workflow.

Current truthful status: SkyClaim's root planning documents and implementation
already existed before this skill-pack inspection. There is no completed devpost/
curriculum record or evidence that all six stages were run. Reading or downloading
skills is not completion. Do not retrofit approved status, invent interview answers,
backdate commits or say the required pack generated earlier files. Establish the
actual curriculum work with the user, and ask the organiser about an existing
in-window project's planning/provenance if eligibility remains unclear.

The user has explicitly asked for autonomous product development, so development
continues under that instruction. The remaining event-specific learner steps are
recorded as a submission dependency, not silently represented as completed.

The pack's reviewed [1-start](../artifacts/devpost-learn/skills/1-start/SKILL.md) and
[6-ship](../artifacts/devpost-learn/skills/6-ship/SKILL.md) are local audit references;
use the upstream repository if the ignored review copy is absent. In particular,
6-ship says: "Submission copy and any optional peer feedback must be human-written,
even on request." The material below is a technical shot list and question guide;
the user supplies their final narration and Devpost answers.

## Two-minute screen recording

| Time | On-screen action | What to explain in your own words |
| --- | --- | --- |
| 0:00–0:20 | Landing page and one example card | Which traveler is stuck, and what decision they need help with |
| 0:20–0:45 | Explore EU example → Check my eligibility | What facts the app needs and why these are illustrative inputs |
| 0:45–1:10 | Result ledger → letter → optional local details | EUR600/person, EUR1,200 for two; how the calculation connects to an actionable draft |
| 1:10–1:35 | Show an India or US example | Why different rulebooks produce different rights; refund is not extra compensation |
| 1:35–1:50 | Weather/conditional or unsupported route | What the app deliberately refuses to guarantee |
| 1:50–2:00 | End on the result or product | One thing you learned and the next validation step |

Use your own concise words rather than reading a page of architecture. Do not spend
the main video scrolling through source code, tests or future features. A shorter
correct demo is stronger than cramming every jurisdiction into a rushed recording.

## Rehearsal and recording mechanics

- Use the checked local production build and template mode with AI disabled.
  Turn off personal notifications and close unrelated/private tabs. Use synthetic
  examples and fictional letter details; never display real tickets or API keys.
- Record a single complete journey before adding any title or explanatory frame.
  Keep text legible at normal playback size; zoom only if needed for readability.
- Avoid printing during recording. Show the letter preview and copy action; native
  print pagination remains a separate browser verification task.
- Record a backup before the final take. Keep one local copy. Upload the finished
  video to a publicly accessible YouTube/Vimeo URL and verify access signed out.
- If the live cloud service is not verified, say the demonstration runs locally.
  Do not imply Firebase is deployed merely because config and server code exist.

## Questions your entry should answer

Write these in your own voice: Who is the user? What can they finish today? What is
different from existing tools? Which AI-assisted development decisions did you make?
What did you learn from a specific bug or boundary? Which functionality is future
work? I can check factual coverage and grammar after you write the answers.

## Suggested remaining schedule (IST)

19 October: complete hardening and local evidence. 20–21 October: legal/user review,
Firebase staging and a rough recording. 22 October: prepare an early complete entry
if seeking the optional review. 23–24 October: apply useful feedback and record the
final video. 25 October: inspect the public repository/video and finish the entry.
26 October: use the day for checks and submission buffer; avoid the 02:30 cutoff.
These are proposed working dates, not claims that those actions have happened.

## Final release/entry gate

- [ ] Confirm entrant eligibility and honest creation/reuse provenance.
- [ ] Resolve required Devpost curriculum use and generated-document evidence.
- [ ] Review public files/history for secrets, private references and unrelated data.
- [ ] Select an open-source license for original code and retain third-party notices.
- [ ] Create/publish a reviewed public repository and verify the link signed out.
- [ ] Record, upload and verify the required short working-demo video.
- [ ] Complete the learner-written description, required answers and survey.
- [ ] Submit on Devpost and verify the actual confirmation.

No repository publication, video upload, Discord message or event submission was
performed by this development task. These actions have not been represented as done.

# Implementation ledger — PLAN.md

Latest preview policy: full ballistic preview is available only in practice/test rounds. Ordinary races show only the short launch-direction arrow. One-Shot Championship has no pre-shot preview; the previously requested teacher-controlled post-round solution reveal remains. Preview gating has a regression test; 25 pure tests and all seven browser tests pass after this change.

Host update: explicit Next level / New match controls; shared per-map stroke scoreboard and totals; client and rule-enforced nickname filter. New tests: 24 pure, 15 rules, 7 browser. Review fixes prevent practice contamination, sanitize all Canvas names, and freeze rounds with server timestamps before fetching and archiving accepted strokes. See HOST_UPDATE.md and VERIFICATION.md.

Ruling: proceed inline using the supplied handoff, per explicit instruction to implement without stopping at planning.
Ruling: use a new nested Git repository rather than a worktree of School; the game must be independent and contain no grading records.
Ruling: no Sites hosting; the user's GitHub Pages + Firebase target takes precedence.

Tasks 1–6 implemented. Verification: 19 pure tests, 12 Firebase rules emulator tests, six Chrome browser tests across final runs, and strict TypeScript/production Vite build passed. Two isolated student clients plus a teacher were tested in one emulator room. Cached production reload and play passed with the browser fully offline.

User GUI steering implemented: drag protractor for angle; green/yellow/red growing rectangles for speed; pre-shot preview is only a short direction arrow. One-shot championship retains no preview. Decimal entry remains available.

Independent review fixes: preserve race start when ending; hide peer submissions before FIRE; include checkpoint error in one-shot scoring; reject inward slope departure; disable End during calculation.

Ruling: Firebase RTDB rules have no numChildren method. Capacity uses 40 immutable claim slots plus matching membership references in an atomic update. Concurrent claims for the 40th slot were tested; exactly one succeeds.

Ruling: exact three-point example requires 19.963299660460276 m/s, not 19.95996. The supplied approximation is tested within rounding tolerance.

Ruling: deployment will initially be offline-only because no production Firebase configuration was supplied. Production setup and acceptance steps are explicit in README and VERIFICATION.md; emulator integration is not represented as production verification.

Ruling: an observed Vary: Origin cache mismatch on JS/CSS caused a failed offline reload. Cache matching now ignores Vary only inside this app’s named precache of same-origin static build assets. Offline regression test passes.

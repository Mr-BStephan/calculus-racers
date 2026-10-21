# Implementation ledger — PLAN.md

Appearance update: 16 original procedural racers and 12 independent palette colors. The avatar, selection thumbnails and course renderer share drawCharacter. Racer.color is optional for old records; new records store validated color0–11 and sprite0–15. Both selections lock after joining and restore from room data on reload. Full verification: 28 pure, 16 rules, 8 browser tests; build passed and independent review completed.

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

Training flag update: host-only Randomize training flag button in Training Meadow practice; shared 40–220 m terrain-grounded flag, fresh practice epoch, positions/strokes reset. Competitive finishes and one-shot missions retain their prescribed conditions. Verified 32 pure + 17 rules + 8 browser tests and TypeScript/build.

Production setup: authenticated project administrator CLI, deployed restricted rules explicitly to calculus-racers, retrieved public web configuration, stored GitHub Actions variable and successfully redeployed Pages. Verified enabled Google/Anonymous providers and authorized Pages domain. Two independent real production student clients passed shared target/reset/rejoin/race launch and server event readback; temporary fixtures/accounts removed. Teacher Google login/allowlist and full teacher-led session remain pending.

Host beta fix: empty teacher rooms now explain spectator mode and offer Play as host. Host participates through a normal free slot without replacing students, retains master controls, and can launch after Start practice/race. Fixed saved nickname and joining-state restoration on refresh. User’s existing production room was inspected read-only and preserved.

October 21 update: cosmetic width/height 75–135%, actual six-metre landing finish with overshoot recovery, and fixed-screen local one-shot Island Championship. Host can select independent solo play for the class; individual shots use no Firebase writes. Original three-point round preserved as Classic. New isolated island mechanics/UI modules reuse shared deterministic physics, renderer and aiming controls.

Follow-up: translucent terrain/progress map, local-character halo and foreground priority, 25% nearby-rival opacity/65% distant (spectator remains100%), five progressive race courses and five-map scorecard. Numeric savedcourse IDs retained with explicit logicalcourseOrder.35-racer desktop pack and hostmapchanges tested.

Preview restriction: full aiming trajectory only in Training Meadow practice; other course practice and races use direction-only arrows. Solo islands remain preview-free; Classic post-round teacher solution reveal is unchanged.

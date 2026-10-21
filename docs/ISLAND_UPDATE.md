# Stretch, precision goals, and solo island Championship

User decisions: two independent cosmetic scale sliders; finish by landing near the flag; fixed-screen solo Championship with coordinate grid and semi-random floating island. One shot per map, retry generates another island.

Implementation sequence:
- [x] Add failing tests for appearance bounds, landing distance/overshoot recovery, solvable generated islands, and one-shot state.
- [x] Add 0.75–1.35 width/height cosmetic values to shared original character drawing, selection, immutable racer identity, and database validation. Physics remains unchanged.
- [x] Centralize a 6 m finish radius and terrain-based goal coordinates. Render the zone. Completed collision inside the radius wins; overshoot recovers to a checkpoint. Test reachability of all courses under these rules.
- [x] Add a separate solo island controller using the shared physics/renderer/aiming widgets. Generate reachable islands deterministically from local random seeds; grid and labelled geometry, fixed camera, no trajectory preview, one confirmed shot, retry/new map.
- [x] Replace the main Championship entry with solo islands. Host can switch the class into independent solo play with one control event; solo shots stay local. Keep the original three-point challenge separately labelled for existing curriculum.
- [x] Verify compact 1366×768 and 1024×768 views, cosmetics, misses/success, one shot and independent room clients. Run pure/rules/browser suites, review, deploy restricted rules and Pages, run live two-client smoke checks.

Files: physics/race/course/renderer shared geometry; characters/main/network/rules cosmetics; new island.ts and island-mode.ts for solo mechanics/UI; aim-controls made root/prefix aware without changing existing default IDs. No new dependencies or assets.

Review found and verified fixes for empty numerical input and hidden Canvas dimensions. Physics/curriculum examples retain the original ideal motion equations; generated island reference settings are internal tests only and are never shown or automatically entered for students.

Follow-up scope delivered alongside this update: transparent course mini-map, nearby-rival fading and localracer on top, and five progressively harder race maps. Preserve old numeric map records and expose logical course order separately.

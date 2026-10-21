# Calculus Racers implementation plan

Goal: deliver the handoff as a separate reviewable repository. Execute inline as explicitly requested. Architecture and constraints: DESIGN.md.

1. Pure physics and courses: write failing tests for range, determinism, swept collisions, gap recovery, checkpoint/finish. Implement src/physics.ts and src/courses.ts; run unit suite.
2. Race protocol: write failing tests for epoch/countdown/stale events/ranking. Implement src/race.ts and curriculum interface. Verify deterministic results.
3. Playable Canvas application: src/render.ts, main.ts, style.css. Four courses, procedural racers, controls, camera, observations, sounds, particles, podium, offline cache. Browser-check launch/reset/finish/responsive layout.
4. Firebase: src/network.ts, database.rules.json. Protected teachers, self-membership with room admission, 40 slots, own current launches, connection cleanup, epoch resets, bounded snapshots. Emulator tests must exercise rules rather than inspect rule text.
5. Classroom interface: Google teacher login, create/control/remove, student anonymous join/rejoin, pack spectator, results. Browser tests against emulators; production Firebase multiplayer requires two independent clients in one actual configured room before claiming it works.
6. Packaging: README, emulator setup, GitHub Pages action, environment example, limitations/test ledger. Run build/unit/browser/rules checks as available. Separate local Git repository on feat/calculus-racers-v1; never stage parent school files.

Review focus: first collision on thin walls; departure from sloped ground; midflight reconnect; closed-room rejoin; kicked client's queued writes; concurrent 40th/41st slot; countdown epoch race; unavailable Firebase/offline cold load.

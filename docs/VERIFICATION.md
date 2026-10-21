# Verification — October 20, 2026

## Random training flag update

**32 pure tests**, **17 database rules tests**, and **8 Chrome browser tests** pass; strict TypeScript and production build pass. Coverage verifies terrain height at randomized flags, permitted target ranges, stale-shot rejection after reset, practice-only completion, host-only writes, invalid-condition rejection, and two independent students receiving identical targets and reset stroke counts. Full browser suite passed in 40.9 seconds. Production Firebase remains unconfigured.

## Sprite and color update

**28 pure tests**, **16 database rules tests**, and **8 browser tests** pass. New coverage verifies independent species/color selection, legacy default colors, bounds/ownership validation, and recoloring actual Canvas pixels while preserving the silhouette. Two independent student clients selected different new species/colors, joined one emulator room, and restored saved appearance after reload; the browser test also checks the stored sprite/color indices. Production build and strict TypeScript check pass. Independent review found no important appearance regressions. An earlier development multiplayer run timed out; the subsequent complete eight-test browser run passed, including multiplayer in 24.5 seconds. Production Firebase setup remains pending.

## Host-control update

Updated checks: **24 pure tests**, **15 Firebase rules tests**, and **7 Chrome browser tests**. Coverage adds shared next-map selection for two independent students, host-only scorecard writes, retained map strokes, New match clearing, blocked/obfuscated names in both UI and database rules, and rejection of stroke deletion/fabricated starting sequence. Practice/lobby cannot be ended as competitive rounds. A concurrent launch/Next-level browser test compares archived strokes and closure timestamp with the server-accepted launch. Host archiving freezes the round using a server timestamp, reads authoritative racer data, then saves scores and advances. Canvas names are filtered in every mode, including existing room records.

Production database configuration is still not supplied. Updated Firebase rules must be deployed as part of that setup; GitHub Pages deployment does not deploy database rules.

Local branch: `feat/calculus-racers-v1`. This is a separate Git repository in `School/calculus-racers`, with no grading data or connection to Classroom/Rallyborn.

## Verified

- Locked pnpm 11.25.0 install completes successfully with explicit dependency build-script decisions.
- TypeScript strict check and Vite production build pass. Main bundle ~41.7 kB before gzip; Firebase networking is a separate ~239.9 kB lazy chunk. App CSS ~16.7 kB. No external image/font/sound downloads.
- **19 pure tests** pass: analytic range/time, deterministic repeated flight, actual slopes, inward slope launch blocking, first thin-wall collision, missed-gap recovery, finite/range validation, all four courses reachable, countdown, stale epoch rejection, late replay, ranking and end-race preservation, generated solvable missions and supplied one-shot example including normal rounding tolerance.
- **12 Firebase rules emulator tests** pass for protected teacher authorization, membership reads, owner creation, self-only launch writes, numeric/schema validation, launch cadence, stale epochs, countdown, open/closed admission, two simultaneous applicants for the 40th slot, immutable one-shot submissions, pre-FIRE submission privacy, kicked-player denial, and actual presence disconnect/reconnect cleanup.
- **Browser tests** pass in installed Chrome: pointer protractor and speed meter; multiple strokes/landing/reset; locked decimal one-shot inputs and delayed reveal; 1366/1024/768/390px layouts without horizontal overflow.
- **Three independent browser contexts** (teacher + two anonymous racers) tested against **the same Firebase Emulator Suite room**. Both students joined and launched, rejoined after reload, retained identity while joining was closed, received teacher countdown/reset, took simultaneous ordinary race strokes, locked separate championship shots, launched on teacher FIRE, produced recomputed results, and obeyed player removal. Peer shots remained hidden before FIRE. This verifies emulator integration, not production Firebase.
- **Production offline-cache test** passes: after service-worker activation, all browser networking is disabled, the production page reloads, and the student can take and land a shot. An observed `Vary: Origin` mismatch in Vite preview’s cached JS/CSS was fixed and the failing test rerun successfully.
- Independent read-only code review found result-freezing, submission-privacy, checkpoint-scoring and slope-departure defects. Regression tests and fixes were applied; reviewer rechecked fixes. Ending during calculation is also disabled.

Screenshots from browser QA remain in ignored `test-results/`; they contain invented test names only and are not committed.

## Not verified

- A production Firebase project, Google teacher OAuth and deployed production database rules are **not configured** in this delivery. The Pages site uses offline practice until its public Firebase web config is supplied and it is rebuilt.
- No two-client **production Firebase room** has been tested. Do not infer production multiplayer readiness from emulator results.
- No 35-device physical Chromebook performance test, school-network connectivity pilot, monthly bandwidth measurement or adversarial identity-cycling test has occurred.

## Production acceptance checklist

1. Deploy rules to your own Spark project; enable Anonymous and Google Auth; allowlist the teacher UID via Firebase Console. Configure authorized domains and the public GitHub Actions variable.
2. In teacher + two separate browser profiles, join one actual room; verify distinct racers, shared course/gravity, synchronized countdown and simultaneous launch/replay.
3. Refresh a flying student, interrupt/reconnect its connection, then close/reopen joining. Check rest position and identity, no duplicate strokes, and rejection of old reset epochs.
4. Run a complete championship: 5–7 minute window, two immutable shots, no peer settings before FIRE, recomputed checkpoint/target scoring, delayed solution reveal and a new problem after reset.
5. Remove a test racer; verify the same UID cannot read/write/rejoin. Remove all test room data through Delete room.
6. Pilot 35 devices while projecting the spectator view; inspect Firebase usage and browser frame rates. Check the offline fallback on the actual school network.

Keep actual student names and private project credentials out of test reports and Git history.

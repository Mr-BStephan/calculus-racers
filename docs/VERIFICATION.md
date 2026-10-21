# Verification — October 20, 2026

## Host spawning beta fix

**32 pure tests + 18 rules tests + 9 browser tests passed**, with TypeScript and production build passing. Final full browser run: 43.8 seconds. Independent review caught a closed-joining edge case and admission-listener callback after room deletion; both were fixed and covered. Screenshot verification shows host and student sprites on the course. One development run was interrupted by source/HMR updates; the subsequent stable complete suite passed.

Root cause: teacher sign-in opened a spectator-only room and never created a host racer; an empty room had no explicit waiting guidance. Added Play as host, an empty-course message and clear spectator/playing instructions. Playing hosts claim a regular free slot and use the same launch/submission rules as students; occupied slots cannot be overwritten. Host camera follows their racer while spectator camera continues to track the pack. Refresh restores nickname and actual admission state.

Regression coverage includes host spawning with student admission closed, a second independent student seeing the host racer, host launch/landing, retained racer/strokes/nickname on reload, and host-only room controls. Rules tests verify host slot collision rejection and self launch. Existing production teacher login and allowlist were observed through project state; interactive Google popup remains a human flow.

## Production Firebase connection

The hosted site is now connected to the calculus-racers Spark project through the GitHub Actions public configuration variable. The checked-in restricted database rules were deployed successfully. Admin readback confirms Anonymous and Google sign-in are enabled and mr-bstephan.github.io is authorized. Pages deployment succeeded.

Two independent Chrome browser contexts with distinct anonymous identities joined the same actual production Firebase room. Verified shared training targets, shared reset, rejoin, synchronized race launches, landing, and server readback of both accepted current-epoch launch records. Temporary validation room and its anonymous accounts were removed afterward. An initial test used UI state before asynchronous control updates arrived; the harness was corrected to await shared state and authoritative launch readback, and the complete check passed. Production offline reload/play smoke check also passed with no browser errors.

The temporary room was created and controlled through authenticated project administration for this test. The teacher Google popup, teacher allowlist, teacher-created production rooms, and full production championship remain pending the teacher's first game sign-in. Historical unconfigured notes below describe earlier delivery stages and are superseded by this section.

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

- Teacher Google popup and allowlist completion still require the teacher’s first game sign-in.
- Production student networking was tested with two clients as described above; the full teacher-led classroom and championship acceptance flow is still pending.
- No 35-device physical Chromebook performance test, school-network connectivity pilot, monthly bandwidth measurement or adversarial identity-cycling test has occurred.

## Production acceptance checklist

1. Deploy rules to your own Spark project; enable Anonymous and Google Auth; allowlist the teacher UID via Firebase Console. Configure authorized domains and the public GitHub Actions variable.
2. In teacher + two separate browser profiles, join one actual room; verify distinct racers, shared course/gravity, synchronized countdown and simultaneous launch/replay.
3. Refresh a flying student, interrupt/reconnect its connection, then close/reopen joining. Check rest position and identity, no duplicate strokes, and rejection of old reset epochs.
4. Run a complete championship: 5–7 minute window, two immutable shots, no peer settings before FIRE, recomputed checkpoint/target scoring, delayed solution reveal and a new problem after reset.
5. Remove a test racer; verify the same UID cannot read/write/rejoin. Remove all test room data through Delete room.
6. Pilot 35 devices while projecting the spectator view; inspect Firebase usage and browser frame rates. Check the offline fallback on the actual school network.

Keep actual student names and private project credentials out of test reports and Git history.

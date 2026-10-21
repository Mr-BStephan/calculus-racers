# Verification — October 20, 2026

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

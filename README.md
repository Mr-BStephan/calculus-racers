# Calculus Racers v1.0

**Projectile golf with a racing pace.** Adjust the protractor, set speed with the green/yellow/red block meter, launch, land, and launch again. Race cute procedural characters across four courses. One-Shot Calculus Championship is a separate, timed calculation round with one locked shot per racer/team.

Repository: https://github.com/Mr-BStephan/calculus-racers · GitHub Pages target: https://mr-bstephan.github.io/calculus-racers/

## Run locally

Install Node.js 22 or newer and pnpm 11. Then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite, usually http://127.0.0.1:5173. No Firebase configuration is necessary for single-player practice. `pnpm build` creates `dist/`; `pnpm preview` serves that build. An ordinary static HTTP server can serve the same folder. Opening index.html directly as a file is unsupported.

Practice runs without internet once the production app has loaded and cached successfully. Keep the tab open as a fallback. A first visit to an uncached site still requires internet; pre-open it on the Chromebooks or serve `dist/` on the school network. Development mode has no service worker.

## Playing

- Drag the protractor’s orange handle to rotate your angle, 5–85°. Click or drag across the growing velocity blocks to set speed, 5–40 m/s. Decimal number fields remain available; arrow keys are optional accessibility controls.
- Press **LAUNCH**. Wait to land, then take another stroke. The short pre-shot direction arrow indicates angle only. It never predicts the full trajectory or landing.
- Missing a platform or hitting a wall recovers to the latest checkpoint reached before that stroke. Unlimited strokes prevent soft locks. RESET restarts offline practice.
- Training Meadow introduces aiming; Canyon Race adds gaps; Moon Dash uses 1.62 m/s²; Championship adds hills and walls. Earth courses use 9.8 m/s². Gravity belongs to the course, never an individual player.
- Observations show speed, flight time, horizontal distance and peak height above the launch point. No calculation is required in Unit 2.
- Sound starts muted. Toggle **♪ Off/On**. No external assets, tracking, student logins, emails or real names are required.

## Firebase production setup — project administrator

No production Firebase project is bundled or provisioned. Do these steps in your own project; do **not** enable public-write rules to get past setup.

1. Create a **Spark** project in Firebase Console. Create one Realtime Database in locked mode. This application does not use Firestore, Cloud Functions, paid hosting, or a service account in the browser.
2. Register a web app and copy its **public web configuration**. Include `apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`. Firebase web config identifies the project; rules and Firebase Auth provide authorization.
3. Authentication → Sign-in method: enable **Anonymous** for students and **Google** for teachers. Add the GitHub Pages host (`mr-bstephan.github.io`, or your fork’s host) and `localhost` as authorized domains. The teacher may need school-administrator approval for Google sign-in.
4. Sign into the game once with the teacher’s Google account. It will refuse room creation until allowlisted. Find that Google user’s UID in Firebase Authentication → Users. In the database console, create `/teachers/THAT_UID` with Boolean `true`. Only an administrator should edit this path. Student clients cannot write it. There is no embedded teacher password, nickname trick, room-code privilege or frontend-only teacher role.
5. Copy `.env.example` to `.env.local` and supply the public config as `VITE_FIREBASE_CONFIG`. Do not set `VITE_USE_EMULATORS=true` in a production build. Never put a private key, service account, or password in any `VITE_` variable.
6. Deploy the included rules with the CLI, explicitly naming your production project:

```sh
pnpm exec firebase login
pnpm exec firebase deploy --only database --project YOUR_PROJECT_ID
```

The checked-in default is the disposable **demo-calculus-racers** emulator project. Do not change that default merely to run tests. Alternatively paste `database.rules.json` into the production database Rules editor and publish it after running the emulator tests.

7. Set the GitHub repository **Actions variable** `VITE_FIREBASE_CONFIG` to the same JSON object; then rerun Pages deployment. The public config can be an Actions variable. Private credentials must never be stored in the repo or frontend.
8. Run the production acceptance checklist with **two independent browser clients in the same real Firebase room**, plus the teacher. Emulator success alone does not verify production OAuth, network filtering or deployed rules.

## Local multiplayer tests with multiple tabs

Use the Auth and Database emulators; Java 21 is recommended. The pinned Firebase CLI 14 also runs on older supported Java runtimes, but future versions require newer Java.

```sh
pnpm emulators
# In another terminal:
pnpm seed:emulator
```

Create an ignored `.env.development.local` containing:

```dotenv
VITE_USE_EMULATORS=true
```

Start `pnpm dev -- --port 5175` (or `pnpm exec vite --host 127.0.0.1 --port 5175`). Open three independent tabs. On one, open Teacher dashboard → Sign in & create room. Emulator mode uses a disposable local test teacher seeded by the script; this login path is excluded unless the emulator environment flag is enabled. On the others choose made-up names and join the code.

Auth uses session persistence: separately opened tabs get separate anonymous identities; a tab refresh preserves its identity and room. Do not duplicate a tab in a way that copies sessionStorage. Separate browser profiles/incognito windows are the clearest identity separation. Closing the tab loses that session; rejoining under a new identity consumes another slot until the teacher removes the old racer or starts a fresh room.

```sh
pnpm test                   # pure physics, deterministic race state, championship
pnpm test:rules             # starts database emulator, exercises real rules
# If emulators already run:
pnpm test:rules:running
pnpm seed:emulator          # rules tests reset the disposable database
pnpm test:e2e               # Chrome; dev server on port 5175, emulators configured
```

Set `TEST_URL` to test another local server. Browser tests use installed Chrome (`channel: chrome`). CI may install Chrome or select Playwright Chromium in `playwright.config.ts`. The multiplayer browser test uses three isolated browser contexts, two anonymous racers and one protected emulator teacher. Its deadline advancement uses the local disposable emulator only. Do not point emulator tests at production.

## Teacher workflow — 30 minutes

1. Before class: open the game on the school network; confirm Firebase connectivity and sign in. Keep offline practice preloaded. Use a fresh room for each class.
2. **0–3 min:** create room, project the six-character code, students pick a sprite and invented nickname. Up to 40 racer slots plus the teacher. Each racer may represent a team.
3. **3–8 min:** Start practice. Demonstrate the protractor and speed blocks. Close joining once everyone is in; existing sessions can reconnect while joining is closed.
4. **8–18 min:** choose a course, Start race. All students receive the same course, gravity and 3-second countdown. Race reset starts a new epoch and invalidates old launches. Championship can optionally rank finishers by fewest strokes, breaking ties by time.
5. **18–27 min:** select **New one-shot round**, choose 5, 6 or 7 minutes *before* creating the round. Coordinate grid, start/checkpoint/target and reference equations are visible. Students use calculators, Desmos or paper, enter decimal angle/speed, and confirm once. Teachers can see who has locked; peers cannot read submissions before FIRE. FIRE unlocks after calculation time and begins a shared 3-second countdown.
6. After impacts, view the leaderboard and optionally **Reveal solution**. The equation, derivative, slope, angle, speed and animated ideal path appear. No equation-to-settings conversion is offered to students. A new round generates a different problem and unlocks a fresh single shot.
7. **27–30 min:** discuss results, end the race, then **Delete room** to remove its data. Removing a racer also bans that anonymous UID for the room. Offline practice remains available through the footer button.

If Firebase is blocked, use **Offline practice / leave room**. The game engine, four courses, widgets, observations, sound and solo championship need no Firebase connection. Existing online races pause new local submissions until connected; delayed server-rejected writes cannot grant another championship attempt. Room data is ephemeral classroom data, not a gradebook.

## One-shot mathematics and scoring

All missions start at `(0,0)` and target a point on `y=0`. The checkpoint is strictly between start and target. A deterministic integer mission seed selects known-solvable three-point problems within the allowed launch ranges. No air resistance; constant Earth gravity; no racer collisions. Internal calculations use unrounded IEEE-754 numbers. Display rounding never changes the physics.

For checkpoint `(20,12)`, target `(40,0)`:

```
y = -0.03 x² + 1.2 x
dy/dx = -0.06 x + 1.2
tan(theta) = 1.2
theta = atan(1.2) = 50.1944289077... degrees
v0 = sqrt(9.8 / (0.06 cos²(theta))) = 19.9632996604... m/s
```

The handoff’s `19.95996 m/s` is slightly below the exact speed. Automated tests verify both the exact checkpoint/range and that `50.194°`, `19.95996 m/s` earn full credit. Target and checkpoint errors each have a **0.15 m rounding allowance**. Score is `max(0, round(1000 - 25 max(0, targetError-.15) - 50 max(0, checkpointError-.15)))`. This preserves landing-distance scoring while requiring the specified checkpoint for full credit. Equal points tie by anonymous UID for a stable display, not a mathematical advantage.

Scores are computed by every client, including the teacher, from the teacher-owned mission and immutable angle/speed submissions. No client landing position or submitted score is accepted by the database. The solution trajectory appears only after the teacher reveals it. As with any frontend-only educational game, a student who inspects code can implement a solver; this is not a secure examination platform.

## Physics and synchronization

Physics uses meters and seconds, upward-positive y, ideal ballistic equations and a 1/120 s time grid. Exact line-segment/ballistic intersections resolve the first contact within that grid, so thin walls and sloping ground cannot be tunneled through. Collision body is the racer’s **foot point**; art has no physical radius. A safe top surface permits landing; walls and missed terrain recover to checkpoints. Render frames sample the exact flight rather than integrating a different physics result on each Chromebook.

Network data is bounded: one identity, one current launch and one current championship submission per racer, plus room controls, 40 admission slots and presence. No per-frame position updates or growing launch history. A launch stores epoch, sequence, origin, angle/speed and a server timestamp. All clients derive flight and rest positions. Server clock offset compensates local clock skew. Reconnect replays the current launch to the appropriate position; race resets invalidate stale epochs. Expired rooms refuse student access after six hours.

Rules deny root listing, gate room data by membership, enforce racer ownership and numeric ranges, prevent student race controls, cap admission through 40 unique atomic slots, and enforce at least 750 ms between ordinary launch writes. Student championship submissions are immutable per epoch, allowed only during the calculation window, and private from peers until FIRE. `onDisconnect` removes stale presence. Slots deliberately survive disconnects so interrupted students can rejoin.

Spark currently allows 100 simultaneous Realtime Database connections; one classroom with 35 racers plus a teacher fits that connection ceiling. Quotas still apply. Estimate: 35 racers × 25 launches × ~200-byte launch events × 36 recipients ≈ 6.3 MB raw classroom-event payload, plus protocol overhead, startup snapshots and presence. This is an estimate, not measured billing; inspect Firebase usage after a pilot. Do not run many concurrent classes in one Spark project without checking limits. [Firebase pricing](https://firebase.google.com/pricing), [Realtime Database limits](https://firebase.google.com/docs/database/usage/limits).

## GitHub Pages deployment

The included `.github/workflows/pages.yml` installs the locked dependencies, runs pure tests, builds Vite, and deploys `dist/` using Pages Actions. Relative asset paths and the service worker support project-subpath hosting.

1. Push the game-only repository to GitHub; this project is independent of Rallyborn and the parent School repository.
2. Settings → Pages → Source: **GitHub Actions**.
3. Add the Firebase public configuration Actions variable if classroom multiplayer is ready; otherwise the deployed site offers complete offline single-player.
4. Push `main` or run the Pages workflow manually. Wait for the deployment to succeed and open the returned Pages URL.

No production Firebase rules are deployed by the Pages action. Changing Firebase rules is a separate explicit administrative action. Keep `.env*`, emulator logs, `.local/`, node_modules, test screenshots and all school records out of Git.

## Verification status and limitations

See [docs/VERIFICATION.md](docs/VERIFICATION.md) for measured results and production acceptance work. Production multiplayer must not be called verified until two independent clients race in the same configured production Firebase room.

- Friendly racing, not cheat-proof esports: rules cannot recompute regular-course terrain collisions or prove a submitted launch origin came from the previous landing. A modified client can forge its own ordinary race progress within numeric bounds. It cannot edit someone else’s record or teacher-owned conditions.
- One-shot scoring derives from authoritative mission conditions and immutable settings, but result display still executes frontend code. Verified rankings, tamper-proof timing, globally enforceable rate limiting, automatic expired-room deletion and bans that survive anonymous identity cycling require a trusted backend.
- Stale presence is removed automatically. Historical room records and slots persist until the owner deletes the room. Expiration revokes access but is not automatic deletion. No cross-session championship history or personal information is stored intentionally.
- JavaScript floating-point calculations are deterministic within normal browser precision, not cross-platform bit-exact fixed-point arithmetic. Server timestamps synchronize event time; their clock-offset estimates are not tournament-grade latency compensation.
- No 35-device physical Chromebook load test or school-network pilot has been completed. Browser automation checks layout, not device frame rate.

## v1.1 recommendations

Run a real-classroom pilot and profile 35 devices first. Add touch-target refinements, character selection drawn with the same Canvas sprites, optional accessibility contrast/large-text settings, teacher-exported anonymous results and a richer podium animation. Add trusted-backend verification only if needed and with a separate cost review. Future Unit 3 questions can use `CurriculumMode` in `src/curriculum.ts`, consuming the same `Flight` values rather than a second physics engine.

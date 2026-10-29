# Tangent Target

[Play Tangent Target](https://mr-bstephan.github.io/calculus-racers/tangent-target/)

A free, no-login calculus arcade game. No student information, analytics, database, or network requests are used by the game.

## Controls and modes

- **Arcade:** Start the orbit, then press Space or Release to launch along the tangent. Hits earn 100 points plus a streak bonus, and targets gradually shrink. P pauses; R restarts. Speed and tangent previews are adjustable.
- **Calculus:** Calculate the slope at the displayed point. Enter fractions, decimals (within 0.005), or `undefined` for vertical tangents. Predict the counterclockwise velocity direction, then launch. Eight repeating point patterns include horizontal and vertical tangents on translated circles. Disable hints for independent practice.
- **One-Shot:** Give everyone the same round code for the same target. Drag the release marker, use the angle slider, or type degrees. Confirm one official launch. Scores range from 0 to 1,000: `round(1000 × max(0, 1 − closest-center-distance/3))`. Pre-launch tangent previews are disabled. Restart generates a new code; reusing an attempted code shows its saved result.

Tab and arrow keys operate controls. Sound is optional and off by default. All math uses positive y upward, counterclockwise rotation, and constant straight-line velocity after release, without gravity.

## Classroom use and limitations

Try 5–10 minutes of Arcade, 10 minutes of Calculus, then a shared One-Shot round. One-Shot results stay in this browser's localStorage. A saved reservation is verified before launch; if storage fails, the official launch is blocked. If saving the final result fails, the screen explains that the attempt remains used but a reload may show its reserved score of zero. Closing the page during flight also uses the attempt with a zero score.

This is an honor-system competition, not secure anti-cheat: clearing site data, using another browser, or developer tools can bypass the lock. Avoid simultaneous official launches from multiple tabs. Arcade and Calculus progress reset on reload. Canvas gameplay requires vision; controls, equations and results have text equivalents. Hidden tabs pause motion.

## Maintenance

Source lives in `public/tangent-target/`, copied unchanged by Vite to `dist/tangent-target/`. Relative asset URLs support GitHub Pages' repository prefix. The game does not import the racer's Firebase code.

From the repository root:

```sh
pnpm install --frozen-lockfile
node --test tests/tangent-target.test.mjs tests/tangent-game.test.mjs
pnpm test
pnpm build
pnpm preview
```

Open `/tangent-target/` on the preview server. Edit `game.mjs` for gameplay, `physics.mjs` for geometry, `style.css` for presentation, and `index.html` for controls. Push reviewed changes to `main`; the existing `.github/workflows/pages.yml` tests, builds, and deploys the full site. No additional secrets or Pages settings are needed for this game.

Verification uses geometry tests and Node integration tests executing the actual gameplay event handlers with substituted DOM/Canvas/storage boundaries. Those tests cover all modes and storage failures but do not replace visual browser QA.

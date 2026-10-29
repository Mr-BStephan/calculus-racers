# Tangent Target

[Play Tangent Target](https://mr-bstephan.github.io/calculus-racers/tangent-target/)

A free, no-login calculus arcade game. No student information, analytics, database, or network requests are used by the game.

## Controls and modes

- **Arcade:** Start the orbit, then press Space or Release to launch along the tangent. Hits earn 100 points plus a streak bonus, and targets gradually shrink. P pauses; R restarts. The five-step difficulty slider runs from Cozy to Spicy, increasing target distance along the winning tangent from 2.5 to 5 units and orbit speed from 0.4× to 6×. Speed can also be fine-tuned independently up to 8× (roughly one revolution per 0.68 seconds). Difficulty is locked during a shot and its result; use Next target to adjust again. Tangent previews are optional. Calculus and shared One-Shot rounds are unaffected by Arcade difficulty.
- **Calculus:** Calculate the slope at the displayed point. Enter fractions, decimals (within 0.005), or `undefined` for vertical tangents. Predict the counterclockwise velocity direction, then launch. Eight repeating point patterns include horizontal and vertical tangents on translated circles. Disable hints for independent practice.
- **One-Shot:** Give everyone the same round code for the same target. Drag the release marker, use the angle slider, or type degrees. Confirm one official launch. Scores range from 0 to 1,000: `round(1000 × max(0, 1 − closest-center-distance/3))`. Pre-launch tangent previews are disabled. Restart generates a new code; reusing an attempted code shows its saved result.

Tab and arrow keys operate controls. Sound is optional and off by default. All math uses positive y upward, counterclockwise rotation, and constant straight-line velocity after release, without gravity.

**Continuous Space play:** In Arcade, press Space to start, then again to release. After the result, Space advances straight to the next orbiting target; the next press fires. This works with either launch or next-target focused. Holding Space does not auto-fire, and presses during flight do nothing. Inputs, links and other buttons keep their normal keyboard behavior.

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

## Woodland swing theme

An original procedural raccoon, styled after Calculus Racers, swings from a rope around a wooden post toward a picnic basket. The pink circle inside the basket is the scoring zone; the small center marker under the sprite identifies its tracked point. Sprite and basket decorations do not enlarge collision areas. Successful landings settle into the basket with a brief wiggle and stars; misses finish in leaves. The top-down clearing keeps straight tangent motion consistent with the math. Misses animate for at least 0.9 seconds, including shots aimed away from the basket.

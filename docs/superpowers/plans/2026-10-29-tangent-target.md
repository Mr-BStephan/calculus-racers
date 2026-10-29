# Tangent Target Implementation Plan

**Goal:** Ship an anonymous, Chromebook-friendly tangent-motion game with three modes on the existing GitHub Pages site.
**Architecture:** Self-contained HTML/CSS/ES modules in public/tangent-target, copied unchanged by the existing Vite build. Pure geometry module shared by game and Node tests. No Firebase, student records, network calls, or dependencies in this game.
**Spec:** User's Tangent Target handoff, October 29, 2026. User explicitly delegates design and implementation choices and authorizes commit, push and publication.

## Design decisions
Use Canvas for animation and semantic HTML for controls and mathematical feedback. Use Cartesian y-up coordinates everywhere except rendering. Constant tangent velocity, continuous swept collision, reachable targets constructed from a forward tangent ray. Arcade has progressive targets, streaks and adjustable speed; Calculus freezes a known point and requires slope and velocity direction; One-Shot has a deterministic shared code, angle entry, confirmation, and one locally remembered result per code. Practice hints are optional. Competition rounds never reveal a projected ray before launch.

Alternatives considered: a separate repository adds unnecessary deployment setup; integrating the racer engine couples unrelated games. A standalone public subdirectory preserves the current app and workflow.

## Tasks
- [x] Add geometry tests first: perpendicular velocity, translated centers, vertical slopes, fractions, forward reachable targets, swept collisions and frame-rate independence. Implement pure physics.mjs and pass tests.
- [x] Implement all three modes in index.html, style.css, game.mjs. Verify mode switching, slope validation, one-shot replay lock and keyboard controls in Node integration tests. Browser control unavailable; user explicitly requested completion without it.
- [x] Add README and workflow test step; run existing unit suite and production build. Relative asset paths and built file integrity checked without browser control.
- [ ] Review complete change, commit only game-related files, push to GitHub, publish through existing Pages workflow and verify live URL.

## Review focus
Vertical tangent input must accept undefined/vertical; zero denominator is not a valid fraction. High frame deltas cannot tunnel through targets. Hidden tabs pause motion. One-shot repeated clicks and reloads cannot grant another official attempt for that code; this is a local honor-system lock, not anti-cheat. Small screens must retain keyboard-accessible controls without horizontal scrolling.

## Execution record
Ruling: Work on a new branch in the clean existing checkout, reusing installed dependencies; no changes to school records or previous game source.
Review found failed storage writes could silently bypass the one-shot lock. Regression tests reproduced it; official launches now require a persisted reservation verified by readback. Final-result write failure explicitly warns and keeps the attempt used. Fixed the shots-left counter, restored angle inputs, and aspect-ratio preservation on short viewports.
Validation: 14 new tests, 71 existing unit tests, TypeScript check and production build pass. Actual event handlers run in a Node VM with DOM/Canvas/storage substitutes. This is behavior coverage, not rendered-browser verification. Visual QA remains a known limitation.

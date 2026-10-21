# Calculus Racers v1

User handoff, October 20 2026, is the binding specification. Build a fun launch-based racing game for 35 students and a teacher, with no student personal information and an offline fallback. Separate Git repository; TypeScript, Vite, Canvas, GitHub Pages, Firebase Spark.

Physics uses meters, seconds, upward-positive y, no drag, a 1/120 second timestep and analytic ballistic positions. Each timestep sweeps a segment against every polygon edge, finding the earliest intersection. Sprites are visual; the foot point is the physical collision body. Safe ground edges support the foot; wall impacts recover to the last checkpoint. Four hand-authored courses have fixed gravity. The pure engine returns a complete flight replay so all clients render the same result independent of frame rate.

Networking stores one bounded current launch per player, not frames or unbounded event history. Each launch includes origin, server timestamp, angle, power, race epoch and sequence. Landing is derived, not separately trusted. Existing launch results are the next origin. Server clock offset and epoch checks handle delayed/replayed data. Finish times are client-derived and suitable for friendly competition only.

Rooms have separate admission, member slots, control, racers, presence and bans. Only a protected teacher UID allowlist (edited in Firebase Console) plus Google authentication permits room creation/control. Anonymous users can claim their own member slot in an open room; membership gates room data. Rules cap slots at 40, enforce ownership/types/ranges/epochs/cadence and prevent banned users returning under the same UID. Identity cycling and result cheating require a trusted backend to prevent fully.

Unit 2 is experimentation with observations. Unit 3 is an extension interface over the same flight result. No required questions in v1. Art is procedural and original; sound synthesized. Cache the built app for subsequent offline practice. No Classroom or grading data access.

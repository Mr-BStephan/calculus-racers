# Host control, stroke scorecard and nickname moderation

User request: host controls maps and next-level progression after joining; add stroke scoreboard; block inappropriate nicknames.

Implementation: retain server-enforced owner-only controls; add Next level and New match actions. Every level change resets the shared epoch and waits in the lobby. Archive the latest scored attempt per course in a teacher-owned scorecard, atomically with progression/end. Show all four course stroke columns, total, completed-course count and unfinished markers. Practice never contributes to saved competitive totals. Replaying a course replaces its saved attempt; New match clears all saved scores without removing members.

Moderation: a shared local policy checks ASCII nicknames, common leetspeak, separators, profanity, slurs, sexual/abusive phrases. Generate the same reject expression into Realtime Database rules; bad names fail before reserving a slot. Treat filtering as a classroom aid with false positives/negatives, not a guarantee. Preserve host removal.

Tests first: scorecard aggregation/double-counting and rankings; name filtering and benign-name acceptance; rules deny student map/progression/scorecard writes and filtered names, plus stroke deletion/reset; three-client browser flow for host next-map synchronization, retained strokes, blocked names and clearing a match. Build and deploy to the existing Pages repository after review.

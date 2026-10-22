// Shared playback clock: physics stays in ideal simulated seconds; event
// timestamps, countdowns, study periods and race timing use wall-clock ms.
export const PLAYBACK_RATE=1.25;
export const simulationSeconds=(elapsedMs:number)=>Math.max(0,elapsedMs)*PLAYBACK_RATE/1000;
export const playbackMs=(simulationDuration:number)=>simulationDuration*1000/PLAYBACK_RATE;

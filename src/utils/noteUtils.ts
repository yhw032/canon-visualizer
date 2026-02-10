import * as Tone from 'tone';

// Simple helper to convert "bars:beats:sixteenths" to seconds
// Tone.js uses "Bars:Beats:Sixteenths" format
// At 96 BPM, 4/4 Time Signature
// 1 Bar = 4 Beats = 2.5 Seconds (60/96 * 4 = 2.5)
// 1 Beat (Quarter note) = 0.625 Seconds (60/96)
// 1 Sixteenth = 0.15625 Seconds (60/96/4)
export const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 3) return 0;
  const [bars, beats, sixteenths] = parts;
  const beatDuration = 60 / 96; // 0.625 seconds per beat at 96 BPM
  return (bars * 4 * beatDuration) + (beats * beatDuration) + (sixteenths * beatDuration / 4);
};

export const getNoteDurationSeconds = (durationStr: string): number => {
  const beatDuration = 60 / 96; // 0.625 seconds per beat at 96 BPM
  // Basic mapping for common Tone.js durations at 96 BPM
  if (durationStr === '1m') return 4 * beatDuration; // 2.5s
  if (durationStr === '1n') return 4 * beatDuration; // 2.5s
  if (durationStr === '2n') return 2 * beatDuration; // 1.25s
  if (durationStr === '4n') return beatDuration; // 0.625s
  if (durationStr === '8n') return beatDuration / 2; // 0.3125s
  if (durationStr === '16n') return beatDuration / 4; // 0.15625s
  return Tone.Time(durationStr).toSeconds(); // Fallback if Tone is ready
};

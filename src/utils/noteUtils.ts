import * as Tone from 'tone';

// Simple helper to convert "bars:quarters:sixteenths" to seconds
// Assuming 60 BPM, 4/4 Time Signature
// 1 Bar = 4 Beats = 4 Seconds
// 1 Quarter = 1 Beat = 1 Second
// 1 Sixteenth = 0.25 Seconds
export const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 3) return 0;
  const [bars, quarters, sixteenths] = parts;
  return (bars * 4) + (quarters * 1) + (sixteenths * 0.25);
};

export const getNoteDurationSeconds = (durationStr: string): number => {
  // Basic mapping for common Tone.js durations at 60 BPM
  if (durationStr === '1m') return 4;
  if (durationStr === '1n') return 4;
  if (durationStr === '2n') return 2;
  if (durationStr === '4n') return 1;
  if (durationStr === '8n') return 0.5;
  if (durationStr === '16n') return 0.25;
  return Tone.Time(durationStr).toSeconds(); // Fallback if Tone is ready
};

const fs = require('fs');

// Read MIDI JSON
const data = JSON.parse(fs.readFileSync('c:/Users/admin/Downloads/canon midi.txt', 'utf8'));
const notes = data.tracks[0].notes; // Violino I

// MIDI info: PPQ = 240, BPM = 40
// At 40 BPM: 1 beat = 1.5 seconds
// Start time: 12 seconds = tick 1920

// For our visualizer at 60 BPM:
// 1 beat = 1 second, 1 measure = 4 seconds
// We need to convert from original time to measures:beats:sixteenths

const startTime = notes[0].time; // 12 seconds

function secondsToTime(seconds) {
  const offsetSeconds = seconds - startTime;
  // At 40 BPM, convert to 60 BPM time
  // 40 BPM: 1 beat = 1.5s, 60 BPM: 1 beat = 1s
  // So we scale time by 1.5/1 = 1.5? No, we keep real time same
  // Actually, we want to adjust the PLAYBACK speed, not the note positions
  // Let's normalize to start at 0 and keep real-time seconds

  const bars = Math.floor(offsetSeconds / 4); // 1 measure = 4 seconds @ 60 BPM  
  const remainder = offsetSeconds % 4;
  const beats = Math.floor(remainder);
  const sixteenths = (remainder - beats) / 0.25;

  return `${bars}:${beats}:${Math.round(sixteenths * 100) / 100}`;
}

function durationToNotation(durationSeconds) {
  // Map duration to Tone.js notation
  if (durationSeconds >= 3.8) return '1n'; // whole note
  if (durationSeconds >= 1.9) return '2n'; // half note  
  if (durationSeconds >= 0.9) return '4n'; // quarter note
  if (durationSeconds >= 0.4) return '8n'; // eighth note
  if (durationSeconds >= 0.2) return '16n'; // sixteenth note
  return '32n';
}

// Convert all notes
const output = notes.map(note => {
  const time = secondsToTime(note.time);
  const duration = durationToNotation(note.duration);
  return `  { time: "${time}", note: "${note.name}", duration: "${duration}" },`;
});

// Write output
const header = `export interface NoteData {
  note: string;
  duration: string;
  time: string; // "bars:quarters:sixteenths"
}

// Pachelbel's Canon in D Major - Complete Violino I Track
// Extracted from MIDI, normalized to 60 BPM for visualization
// Total notes: ${notes.length}
// Duration: ~${Math.round((notes[notes.length - 1].time - startTime) / 60)} minutes

export const canonMelody: NoteData[] = [
`;

const footer = `];
`;

const fullOutput = header + output.join('\n') + footer;

fs.writeFileSync('canonData_full.ts', fullOutput);
console.log('Generated canonData_full.ts with', notes.length, 'notes');
console.log('Duration:', Math.round((notes[notes.length - 1].time - startTime)), 'seconds');

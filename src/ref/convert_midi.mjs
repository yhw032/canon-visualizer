import { readFileSync, writeFileSync } from 'fs';

// Read MIDI JSON
const data = JSON.parse(readFileSync('c:/Users/admin/Downloads/canon midi.txt', 'utf8'));
const notes = data.tracks[0].notes; // Violino I

const startTime = notes[0].time; // 12 seconds

function secondsToTime(seconds) {
  const offsetSeconds = seconds - startTime;

  const bars = Math.floor(offsetSeconds / 4); // 1 measure = 4 seconds @ 60 BPM  
  const remainder = offsetSeconds % 4;
  const beats = Math.floor(remainder);
  const sixteenthsValue = (remainder - beats) / 0.25;

  // Format with precision, convert sixteenths to decimal beats
  if (sixteenthsValue < 0.01) {
    return `${bars}:${beats}:0`;
  } else {
    const decimalBeats = beats + (sixteenthsValue * 0.25);
    return `${bars}:${decimalBeats}:0`;
  }
}

// Convert all notes - use actual MIDI duration in seconds for smooth playback
const output = notes.map(note => {
  const time = secondsToTime(note.time);
  // Use actual MIDI duration directly as seconds (e.g. "1.488", "0.738")
  const duration = note.duration.toFixed(3);
  return `  { time: "${time}", note: "${note.name}", duration: "${duration}" },`;
});

// Write output
const header = `export interface NoteData {
  note: string;
  duration: string;
  time: string; // "bars:beats:sixteenths"
}

// Pachelbel's Canon in D Major - Complete Violino I Track
// Extracted from MIDI with ACTUAL durations for smooth playback
// Total notes: ${notes.length}
// Duration: ~${Math.round((notes[notes.length - 1].time - startTime) / 60)} minutes
// BPM: 96 for realistic playback

export const canonMelody: NoteData[] = [
`;

const footer = `];
`;

const fullOutput = header + output.join('\n') + footer;

writeFileSync('canonData_full.ts', fullOutput);
console.log(`Generated canonData_full.ts with ${notes.length} notes`);
console.log(`Duration: ${Math.round((notes[notes.length - 1].time - startTime))} seconds (~${Math.round((notes[notes.length - 1].time - startTime) / 60)} minutes)`);

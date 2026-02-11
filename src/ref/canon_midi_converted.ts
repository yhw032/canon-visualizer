interface ReferenceNoteData {
  time: string;
  note: string;
  duration: string;
}

export const canonMelodyFromMidi: ReferenceNoteData[] = [
  // Measures 1-2: Opening theme (Half notes)
  { time: "0:0:0", note: "F#5", duration: "2n" },
  { time: "0:2:0", note: "E5", duration: "2n" },
  { time: "1:0:0", note: "D5", duration: "2n" },
  { time: "1:2:0", note: "C#5", duration: "2n" },

  // Measures 3-4: Descending bass line (Half notes)
  { time: "2:0:0", note: "B4", duration: "2n" },
  { time: "2:2:0", note: "A4", duration: "2n" },
  { time: "3:0:0", note: "B4", duration: "2n" },
  { time: "3:2:0", note: "C#5", duration: "2n" },

  // Measures 5-6: Quarter note variation
  { time: "4:0:0", note: "D5", duration: "2n" },
  { time: "4:2:0", note: "C#5", duration: "2n" },
  { time: "5:0:0", note: "B4", duration: "2n" },
  { time: "5:2:0", note: "A4", duration: "2n" },

  // Measures 7-8: Moving to quarter notes
  { time: "6:0:0", note: "G4", duration: "2n" },
  { time: "6:2:0", note: "F#4", duration: "2n" },
  { time: "7:0:0", note: "G4", duration: "2n" },
  { time: "7:2:0", note: "E4", duration: "2n" },

  // Measures 9-10: Eighth note passages begin (duration 118 ticks)
  { time: "8:0:0", note: "D4", duration: "4n" },
  { time: "8:1:0", note: "F#4", duration: "4n" },
  { time: "8:2:0", note: "A4", duration: "4n" },
  { time: "8:3:0", note: "G4", duration: "4n" },
  { time: "9:0:0", note: "F#4", duration: "4n" },
  { time: "9:1:0", note: "D4", duration: "4n" },
  { time: "9:2:0", note: "F#4", duration: "4n" },
  { time: "9:3:0", note: "E4", duration: "4n" },

  // Measures 11-12: Eighth notes continuing
  { time: "10:0:0", note: "D4", duration: "4n" },
  { time: "10:1:0", note: "B3", duration: "4n" },
  { time: "10:2:0", note: "D4", duration: "4n" },
  { time: "10:3:0", note: "A4", duration: "4n" },
  { time: "11:0:0", note: "G4", duration: "4n" },
  { time: "11:1:0", note: "B4", duration: "4n" },
  { time: "11:2:0", note: "A4", duration: "4n" },
  { time: "11:3:0", note: "G4", duration: "4n" },

  // Measures 13-14: More eighth note variations
  { time: "12:0:0", note: "F#4", duration: "4n" },
  { time: "12:1:0", note: "D4", duration: "4n" },
  { time: "12:2:0", note: "E4", duration: "4n" },
  { time: "12:3:0", note: "C#5", duration: "4n" },
  { time: "13:0:0", note: "D5", duration: "4n" },
  { time: "13:1:0", note: "F#5", duration: "4n" },
  { time: "13:2:0", note: "A5", duration: "4n" },
  { time: "13:3:0", note: "A4", duration: "4n" },

  // Measures 15-16: Continuing the melodic line
  { time: "14:0:0", note: "B4", duration: "4n" },
  { time: "14:1:0", note: "G4", duration: "4n" },
  { time: "14:2:0", note: "A4", duration: "4n" },
  { time: "14:3:0", note: "F#4", duration: "4n" },
  { time: "15:0:0", note: "D4", duration: "4n" },
  { time: "15:1:0", note: "D5", duration: "4n" },

  // Measures 17-18: Half notes return with held note at start
  { time: "16:0:0", note: "D5", duration: "2n" },   // Longer held note (178 ticks)
  { time: "16:2.5:0", note: "C#5", duration: "8n" }, // 58 ticks = eighth note

  // Sixteenth note passages (58 ticks each = eighth notes at 60 BPM)
  { time: "17:0:0", note: "D5", duration: "8n" },
  { time: "17:0.5:0", note: "C#5", duration: "8n" },
  { time: "17:1:0", note: "D5", duration: "8n" },
  { time: "17:1.5:0", note: "D4", duration: "8n" },
  { time: "17:2:0", note: "C#4", duration: "8n" },
  { time: "17:2.5:0", note: "A4", duration: "8n" },
  { time: "17:3:0", note: "E4", duration: "8n" },
  { time: "17:3.5:0", note: "F#4", duration: "8n" },

  // Measure 19: Continuing eighth note lines
  { time: "18:0:0", note: "D4", duration: "8n" },
  { time: "18:0.5:0", note: "D5", duration: "8n" },
  { time: "18:1:0", note: "C#5", duration: "8n" },
  { time: "18:1.5:0", note: "B4", duration: "8n" },
  { time: "18:2:0", note: "C#5", duration: "8n" },
  { time: "18:2.5:0", note: "F#5", duration: "8n" },
  { time: "18:3:0", note: "A5", duration: "8n" },
  { time: "18:3.5:0", note: "B5", duration: "8n" },

  // Measure 20-21: High register passages
  { time: "19:0:0", note: "G5", duration: "8n" },
  { time: "19:0.5:0", note: "F#5", duration: "8n" },
  { time: "19:1:0", note: "E5", duration: "8n" },
  { time: "19:1.5:0", note: "G5", duration: "8n" },
  { time: "19:2:0", note: "F#5", duration: "8n" },
  { time: "19:2.5:0", note: "E5", duration: "8n" },
  { time: "19:3:0", note: "D5", duration: "8n" },
  { time: "19:3.5:0", note: "C#5", duration: "8n" },

  { time: "20:0:0", note: "B4", duration: "8n" },
  { time: "20:0.5:0", note: "A4", duration: "8n" },
  { time: "20:1:0", note: "G4", duration: "8n" },
  { time: "20:1.5:0", note: "F#4", duration: "8n" },
  { time: "20:2:0", note: "E4", duration: "8n" },
  { time: "20:2.5:0", note: "G4", duration: "8n" },
  { time: "20:3:0", note: "F#4", duration: "8n" },
  { time: "20:3.5:0", note: "E4", duration: "8n" },
];

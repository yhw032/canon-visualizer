export interface NoteData {
  note: string;
  duration: string;
  time: string; // "bars:quarters:sixteenths"
}

// Pachelbel's Canon in D Major - Approx 8 measures of the main melody theme
// 60 BPM -> 1 Quarter note = 1 second.
// This is a simplified version of the famous "Ground Bass" + Melody entry
// Actually, for visualizer, we want the "Melody" that canons.
// Measure 1-2: F# - E - D - C#... (The famous descending scale starting measure 3 of the piece usually)

export const canonMelody: NoteData[] = [
  // [1-2마디] 웅장한 테마의 시작 (2분음표 위주)
  { time: "0:0:0", note: "F#5", duration: "2n" },
  { time: "0:2:0", note: "E5", duration: "2n" },
  { time: "1:0:0", note: "D5", duration: "2n" },
  { time: "1:2:0", note: "C#5", duration: "2n" },

  // [3-4마디] 베이스를 따라 하행 (2분음표)
  { time: "2:0:0", note: "B4", duration: "2n" },
  { time: "2:2:0", note: "A4", duration: "2n" },
  { time: "3:0:0", note: "B4", duration: "2n" },
  { time: "3:2:0", note: "C#5", duration: "2n" },

  // [5-6마디] 조금 더 빨라지는 움직임 (4분음표)
  { time: "4:0:0", note: "D5", duration: "4n" },
  { time: "4:1:0", note: "C#5", duration: "4n" },
  { time: "4:2:0", note: "B4", duration: "4n" },
  { time: "4:3:0", note: "A4", duration: "4n" },
  { time: "5:0:0", note: "G4", duration: "4n" },
  { time: "5:1:0", note: "F#4", duration: "4n" },
  { time: "5:2:0", note: "E4", duration: "4n" },
  { time: "5:3:0", note: "G4", duration: "4n" },

  // [7-8마디] 카논 시각화의 꽃, 8분음표의 향연
  { time: "6:0:0", note: "F#4", duration: "8n" },
  { time: "6:0:2", note: "D4", duration: "8n" },
  { time: "6:1:0", note: "F#4", duration: "8n" },
  { time: "6:1:2", note: "A4", duration: "8n" },
  { time: "6:2:0", note: "E4", duration: "8n" },
  { time: "6:2:2", note: "C#4", duration: "8n" },
  { time: "6:3:0", note: "E4", duration: "8n" },
  { time: "6:3:2", note: "G4", duration: "8n" },

  { time: "7:0:0", note: "F#4", duration: "8n" },
  { time: "7:0:2", note: "D4", duration: "8n" },
  { time: "7:1:0", note: "B3", duration: "8n" },
  { time: "7:1:2", note: "D4", duration: "8n" },
  { time: "7:2:0", note: "A3", duration: "8n" },
  { time: "7:2:2", note: "C#4", duration: "8n" },
  { time: "7:3:0", note: "D4", duration: "8n" },
  { time: "7:3:2", note: "E4", duration: "8n" },
];

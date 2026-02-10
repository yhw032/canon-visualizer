import React, { useMemo } from 'react';
import type { NoteData } from '../data/canonData';
import { NoteBox } from './NoteBox';
import { parseTimeToSeconds, getNoteDurationSeconds } from '../utils/noteUtils';

interface LaneProps {
  laneId: number;
  melody: NoteData[];
  offsetMeasure: number; // e.g., 0, 2, 4
  pixelsPerSecond: number;
  activeNote: string | null;
}

export const Lane: React.FC<LaneProps> = ({ laneId, melody, offsetMeasure, pixelsPerSecond, activeNote }) => {
  // Convert melody times to pixel positions once
  const notesWithPosition = useMemo(() => {
    const offsetSeconds = offsetMeasure * 2.5; // 1 measure = 2.5 seconds @ 96 BPM
    return melody.map((item, index) => {
      const startTime = parseTimeToSeconds(item.time) + offsetSeconds;
      const durationSeconds = getNoteDurationSeconds(item.duration);
      return {
        ...item,
        startPixel: startTime * pixelsPerSecond,
        widthPixel: durationSeconds * pixelsPerSecond,
        key: `${laneId}-${index}-${item.time}`
      };
    });
  }, [melody, offsetMeasure, pixelsPerSecond, laneId]);

  return (
    <div className="relative w-full h-24 bg-slate-800/50 border-b border-slate-700 overflow-visible">
      <div className="absolute left-4 top-1 text-slate-400 text-xs font-mono">
        Violin {laneId + 1} (Offset: {offsetMeasure} bars)
      </div>

      {/* Container for notes - This will be moved by the parent via transform, or we render static positions relative to a moving parent? 
          Actually, easier if THIS container is static relative to the screen, and the NOTES are inside a moving wrapper?
          No, the user wants "Conveyor Belt".
          So let's put a "Belt" div inside here.
      */}
      <div className="belt absolute top-0 left-0 w-full h-full pointer-events-none">
        {notesWithPosition.map(note => (
          <NoteBox
            key={note.key}
            note={note.note}
            width={note.widthPixel}
            left={note.startPixel} // This is relative to the START timing. Parent needs to shift this Belt.
            isActive={activeNote === note.note} // Simple check; for polyphony might need more precise matching, but for Canon melody it's mostly monophonic per part
          />
        ))}
      </div>
    </div>
  );
};

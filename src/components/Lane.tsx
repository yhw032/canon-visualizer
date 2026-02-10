import React, { useMemo } from 'react';
import type { NoteData } from '../hooks/useCanonAudio';
import * as Tone from 'tone';

interface LaneProps {
  laneId: number;
  melody: NoteData[];
  currentTime: number;
  label: string;
  pixelsPerSecond: number;
  playheadPosition: number; // pixels from left
}

export const Lane: React.FC<LaneProps> = React.memo(({
  laneId,
  melody,
  currentTime,
  label,
  pixelsPerSecond,
  playheadPosition
}) => {
  // Viewport culling: only render notes within visible time range
  // This dramatically reduces DOM nodes from 3000+ to ~50-100
  const visibleNotes = useMemo(() => {
    const viewportTimeStart = currentTime - 15; // 15 seconds before NOW
    const viewportTimeEnd = currentTime + 15;   // 15 seconds after NOW

    return melody.filter(item => {
      const noteEndTime = item.time + item.duration;
      // Only include notes that overlap with viewport
      return noteEndTime >= viewportTimeStart && item.time <= viewportTimeEnd;
    });
  }, [melody, currentTime]);

  // Convert notes to positioned boxes with pitch-based colors
  const notesWithPosition = useMemo(() => {
    return visibleNotes.map((item, index) => {
      const startPixels = item.time * pixelsPerSecond;
      const widthPixels = item.duration * pixelsPerSecond;

      // Convert note name to MIDI pitch for color mapping
      const midiPitch = Tone.Frequency(item.note).toMidi();
      // Canon's actual range is roughly D3 (50) to D6 (86)
      // Map to full spectrum for vibrant colors
      const minPitch = 50;  // D3
      const maxPitch = 86;  // D6
      const hue = 240 - ((midiPitch - minPitch) / (maxPitch - minPitch)) * 240;

      return {
        id: `${laneId}-${item.time.toFixed(2)}-${index}`,
        note: item.note,
        left: startPixels,
        width: Math.max(widthPixels, 2),
        time: item.time,
        duration: item.duration,
        hue: Math.max(0, Math.min(240, Math.round(hue))), // Clamp 0-240
      };
    });
  }, [visibleNotes, pixelsPerSecond, laneId]);

  // Calculate transform to scroll notes
  const transformX = playheadPosition - (currentTime * pixelsPerSecond);

  return (
    <div className="relative w-full h-24 bg-slate-800/50 border-b border-slate-700 overflow-hidden">
      {/* Lane Label */}
      <div className="absolute left-4 top-1 text-slate-400 text-xs font-mono z-10">
        {label}
      </div>

      {/* Conveyor Belt with Notes */}
      <div
        className="absolute top-0 left-0 h-full"
        style={{
          transform: `translateX(${transformX}px)`,
          willChange: 'transform'
        }}
      >
        {notesWithPosition.map((noteBox) => {
          const isActive = currentTime >= noteBox.time &&
            currentTime <= noteBox.time + noteBox.duration;

          return (
            <div
              key={noteBox.id}
              className={`absolute top-1/2 -translate-y-1/2 h-16 rounded ${isActive ? 'border-2 shadow-lg' : 'border'
                }`}
              style={{
                left: `${noteBox.left}px`,
                width: `${noteBox.width}px`,
                backgroundColor: isActive
                  ? `hsl(${noteBox.hue}, 80%, 60%)`
                  : `hsl(${noteBox.hue}, 60%, 35%)`,
                borderColor: isActive
                  ? `hsl(${noteBox.hue}, 90%, 70%)`
                  : `hsl(${noteBox.hue}, 50%, 40%)`,
                boxShadow: isActive
                  ? `0 0 20px hsl(${noteBox.hue}, 80%, 60%)`
                  : 'none',
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white select-none">
                {noteBox.note}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

Lane.displayName = 'Lane';

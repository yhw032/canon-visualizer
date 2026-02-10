import React, { useMemo } from 'react';
import { NoteData } from '../hooks/useCanonAudio';

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

  // Convert notes to positioned boxes
  const notesWithPosition = useMemo(() => {
    return visibleNotes.map((item, index) => {
      const startPixels = item.time * pixelsPerSecond;
      const widthPixels = item.duration * pixelsPerSecond;

      return {
        id: `${laneId}-${item.time.toFixed(2)}-${index}`, // Stable key using time
        note: item.note,
        left: startPixels,
        width: Math.max(widthPixels, 2), // Minimum 2px width
        time: item.time,
        duration: item.duration,
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
              className={`absolute top-1/2 -translate-y-1/2 h-16 rounded ${isActive
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 border-2 border-blue-300 shadow-lg shadow-blue-500/50'
                  : 'bg-blue-900/40 border border-blue-700/50'
                }`}
              style={{
                left: `${noteBox.left}px`,
                width: `${noteBox.width}px`,
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

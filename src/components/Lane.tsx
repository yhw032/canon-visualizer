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
  // Optimization: use binary search or simple indexing if possible, 
  // but even O(N) filter is usually okay for 3000. 
  // Let's refine the CSS performance which is the likely bottleneck.
  const visibleNotes = useMemo(() => {
    const viewportTimeStart = currentTime - 8; // Narrower window for better performance
    const viewportTimeEnd = currentTime + 15;

    // Use filter but focus on keeping the DOM small
    return melody.filter(item => {
      const noteEndTime = item.time + item.duration;
      return noteEndTime >= viewportTimeStart && item.time <= viewportTimeEnd;
    });
  }, [melody, currentTime]);

  // Convert notes to positioned boxes with pitch-based colors and Y-offsets
  const notesWithPosition = useMemo(() => {
    return visibleNotes.map((item, index) => {
      const startPixels = item.time * pixelsPerSecond;
      const widthPixels = item.duration * pixelsPerSecond;

      // Convert note name to MIDI pitch
      const midiPitch = Tone.Frequency(item.note).toMidi();

      // Pitch-to-Y Offset: Map D3(50) to D6(86) to range within lane
      const minPitch = 50;
      const maxPitch = 86;
      const pitchRatio = (midiPitch - minPitch) / (maxPitch - minPitch);
      // Higher pitch -> lower 'top' value (top of lane)
      const topOffsetPercent = 85 - (pitchRatio * 70); // Keep notes between 15% and 85% height

      // Pitch-to-Color Palette: Fixed neon colors for specific notes
      const pitchClass = midiPitch % 12; // 0=C, 1=C#, 2=D, ...
      const colorMap: Record<number, string> = {
        2: 'var(--color-neon-lime)',  // D
        6: 'var(--color-neon-cyan)',  // F#
        9: 'var(--color-neon-pink)',  // A
        11: 'var(--color-stark-white)', // B
        4: '#ff9900', // E (Amber)
        7: '#99ff00', // G (Green-Lime)
        1: '#ff0066', // C# (Red-Pink)
      };
      const pitchColor = colorMap[pitchClass] || 'var(--color-stark-white)';

      return {
        id: `${laneId}-${item.time.toFixed(2)}-${index}`,
        note: item.note,
        left: startPixels,
        width: Math.max(widthPixels, 2),
        time: item.time,
        duration: item.duration,
        top: topOffsetPercent,
        pitchColor,
      };
    });
  }, [visibleNotes, pixelsPerSecond, laneId]);

  // Calculate transform to scroll notes
  const transformX = playheadPosition - (currentTime * pixelsPerSecond);

  return (
    <div className="relative w-full h-24 bg-black border-y border-stark-white/20 overflow-hidden mb-2">
      {/* Lane Label - Rotated and repositioned */}
      <div className="absolute right-4 bottom-1 text-stark-white font-black text-xs z-20 opacity-30 select-none">
        {label} / CH_0{laneId}
      </div>

      {/* Background Grid Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-px bg-stark-white" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-stark-white" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-stark-white" />
      </div>

      {/* Conveyor Belt with Notes */}
      <div
        className="absolute top-0 left-0 h-full"
        style={{
          transform: `translateX(${transformX}px) translateZ(0)`, // Force GPU layer
          willChange: 'transform'
        }}
      >
        {notesWithPosition.map((noteBox) => {
          const isActive = currentTime >= noteBox.time &&
            currentTime <= noteBox.time + noteBox.duration;

          return (
            <div
              key={noteBox.id}
              className={`absolute h-4 transition-transform duration-75 ${isActive ? 'z-30' : 'z-20'
                }`}
              style={{
                top: `${noteBox.top}%`,
                left: `${noteBox.left}px`,
                width: `${noteBox.width}px`,
                // Keep the fill but make it much more visible (40% vs 20%)
                backgroundColor: isActive
                  ? noteBox.pitchColor
                  : `${noteBox.pitchColor}66`,
                border: `2px solid ${isActive ? 'white' : noteBox.pitchColor}`,
                mixBlendMode: 'screen',
                boxShadow: isActive ? `0 0 30px ${noteBox.pitchColor}` : 'none',
                transform: `translateY(-50%) ${isActive ? 'scaleY(1.8)' : 'scaleY(1)'}`,
                clipPath: isActive
                  ? 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)'
                  : 'none',
              }}
            >
              {isActive && (
                <div
                  className="absolute inset-0 bg-white opacity-40 animate-pulse"
                  style={{ mixBlendMode: 'overlay' }}
                />
              )}
              <span className={`absolute -top-5 left-0 text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-stark-white' : 'text-stark-white/60'
                }`}>
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

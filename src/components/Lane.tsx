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
  theme: 'dark' | 'light';
  volume: number;
  isMuted: boolean;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
}

export const Lane: React.FC<LaneProps> = React.memo(({
  laneId,
  melody,
  currentTime,
  label,
  pixelsPerSecond,
  playheadPosition,
  theme,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute
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

  // Calculate visible measures (1 measure = 4 beats)
  const visibleMeasures = useMemo(() => {
    const beatsPerMeasure = 4;
    const viewportTimeStart = currentTime - 8;
    const viewportTimeEnd = currentTime + 15;

    const startMeasure = Math.floor(Math.max(0, viewportTimeStart) / beatsPerMeasure);
    const endMeasure = Math.ceil(viewportTimeEnd / beatsPerMeasure);

    const measures = [];
    const palette = [
      '#ff5555', '#55ff55', '#5555ff', '#ffff55',
      '#ff55ff', '#55ffff', '#ffaa55', '#aa55ff'
    ];

    for (let m = startMeasure; m <= endMeasure; m++) {
      // Canon Sync Logic:
      // Voice I (Lane 0) is the reference.
      // Voice II (Lane 1) follows by 2 measures.
      // Voice III (Lane 2) follows by 4 measures.
      // Viola (Lane 3)
      // Continuo (Lane 4) usually repeats every 2 measures.

      let themeMeasureIndex = m;
      if (laneId === 1) themeMeasureIndex = m - 2;
      if (laneId === 2) themeMeasureIndex = m - 4;
      if (laneId === 3) themeMeasureIndex = m - 6;
      if (laneId === 4) themeMeasureIndex = m % 2; // Continuo cycle

      // Only color if theme measure is >= 0
      const color = themeMeasureIndex >= 0
        ? palette[Math.abs(themeMeasureIndex) % palette.length]
        : 'transparent';

      measures.push({
        index: m,
        left: m * beatsPerMeasure * pixelsPerSecond,
        width: beatsPerMeasure * pixelsPerSecond,
        color
      });
    }
    return measures;
  }, [currentTime, pixelsPerSecond, laneId]);

  // Calculate transform to scroll notes
  const transformX = playheadPosition - (currentTime * pixelsPerSecond);

  return (
    <div
      className="relative w-full h-24 border-y overflow-hidden mb-2 transition-colors duration-300 group"
      style={{ backgroundColor: 'var(--bg-lane)', borderColor: 'rgba(var(--text-primary-rgb), 0.1)' }}
    >
      {/* Controls Overlay (Left Side) - Fixed Position within Lane */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-50 border-r flex flex-col items-center justify-between py-2 transition-all duration-300"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-main)',
          boxShadow: '5px 0 15px rgba(0,0,0,0.5)' // Add shadow to separate from content
        }}
      >
        {/* Mute Toggle */}
        <button
          onClick={onToggleMute}
          className={`w-10 h-6 flex items-center justify-center border text-[9px] font-black transition-all ${isMuted
            ? 'bg-neon-pink text-black border-neon-pink'
            : 'bg-transparent text-primary hover:bg-white hover:text-black'
            }`}
          style={{
            borderColor: isMuted ? 'var(--color-neon-pink)' : 'var(--text-primary)',
            color: isMuted ? 'black' : 'var(--text-primary)'
          }}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? 'MUTED' : 'ON'}
        </button>

        {/* Volume Slider (Vertical) */}
        <div className="relative h-full w-full flex items-center justify-center overflow-visible">
          {/* Custom Range Input - Rotated */}
          <input
            type="range"
            min="-40"
            max="0"
            step="1"
            value={isMuted ? -40 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 h-4 -rotate-90 origin-center cursor-pointer opacity-80 hover:opacity-100"
            style={{
              accentColor: 'var(--brand-primary)'
            }}
          />
        </div>
      </div>

      {/* Lane Label - Rotated and repositioned */}
      <div
        className="absolute right-4 bottom-1 font-black text-xs z-20 opacity-30 select-none transition-colors duration-300"
        style={{ color: 'var(--text-primary)' }}
      >
        {label} / CH_0{laneId}
      </div>

      {/* Background Grid Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-px" style={{ backgroundColor: 'var(--text-primary)' }} />
        <div className="absolute top-1/4 left-0 w-full h-px" style={{ backgroundColor: 'var(--text-primary)' }} />
        <div className="absolute top-3/4 left-0 w-full h-px" style={{ backgroundColor: 'var(--text-primary)' }} />
      </div>

      {/* Conveyor Belt with Measures and Notes */}
      <div
        className="absolute top-0 left-0 h-full"
        style={{
          transform: `translateX(${transformX}px) translateZ(0)`, // Force GPU layer
          willChange: 'transform',
          opacity: isMuted ? 0.3 : 1,
          filter: isMuted ? 'grayscale(80%) blur(0.5px)' : 'none',
          transition: 'opacity 0.5s ease'
        }}
      >
        {/* Render Measures */}
        {visibleMeasures.map((m) => (
          <React.Fragment key={m.index}>
            {/* Measure Tint */}
            <div
              className="absolute top-0 h-full opacity-[0.08]"
              style={{
                left: `${m.left}px`,
                width: `${m.width}px`,
                backgroundColor: m.color,
                borderLeft: '1px solid var(--text-primary)',
              }}
            />
            {/* Measure Number */}
            <div
              className="absolute top-1 font-mono text-[8px] opacity-20"
              style={{ left: `${m.left + 4}px`, color: 'var(--text-primary)' }}
            >
              M.{m.index + 1}
            </div>
          </React.Fragment>
        ))}
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
                // Keep the fill but make it much more visible
                backgroundColor: isActive
                  ? noteBox.pitchColor
                  : `color-mix(in srgb, ${noteBox.pitchColor}, transparent calc(100% - (var(--note-opacity) * 100%)))`,
                border: `2px solid ${isActive ? 'var(--active-note-border)' : noteBox.pitchColor}`,
                mixBlendMode: 'var(--note-blend-mode)' as any,
                boxShadow: (isActive && theme === 'dark') ? `0 0 30px ${noteBox.pitchColor}` : 'none',
                transform: `translateY(-50%) ${isActive ? 'scaleY(1.8)' : 'scaleY(1)'}`,
                clipPath: isActive
                  ? 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)'
                  : 'none',
              }}
            >
              {isActive && (
                <div
                  className="absolute inset-0 opacity-40 animate-pulse"
                  style={{ mixBlendMode: 'overlay', backgroundColor: 'var(--text-primary)' }}
                />
              )}
              <span
                className={`absolute -top-5 left-0 text-[10px] font-black uppercase tracking-tighter transition-colors duration-300`}
                style={{ color: isActive ? 'var(--text-primary)' : 'rgba(var(--text-primary-rgb), 0.6)' }}
              >
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

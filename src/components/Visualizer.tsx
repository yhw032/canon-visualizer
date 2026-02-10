import React, { useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { Lane } from './Lane';
import { canonMelody } from '../data/canonData';
import { useCanonAudio } from '../hooks/useCanonAudio';

const PIXELS_PER_SECOND = 150;
const PLAYHEAD_X_PERCENT = 0.3; // 30% from the left

export const Visualizer: React.FC = () => {
  const { isPlaying, start, stop, activeNotes } = useCanonAudio();
  const lanesRef = useRef<(HTMLDivElement | null)[]>([]);
  const requestRef = useRef<number>(0);
  const playheadRef = useRef<HTMLDivElement>(null);

  // Animation Loop
  const animate = () => {
    const now = Tone.Transport.seconds;

    // Move the belts
    // Current visual position = (Time * Speed)
    // We want the note at "Time" to be at "Playhead".
    // NotePos = NoteTime * Speed
    // BeltOffset = PlayheadPos - (Time * Speed)
    // So NoteScreenPos = NotePos + BeltOffset = NoteTime*Speed + Playhead - Time*Speed = (NoteTime - Time)*Speed + Playhead
    // If NoteTime == Time, Pos = Playhead. Correct.

    if (playheadRef.current) {
      const playheadPixel = window.innerWidth * PLAYHEAD_X_PERCENT;
      const transformValue = `translateX(${playheadPixel - (now * PIXELS_PER_SECOND)}px)`;

      lanesRef.current.forEach(laneDiv => {
        if (laneDiv) {
          const belt = laneDiv.querySelector('.belt') as HTMLElement;
          if (belt) {
            belt.style.transform = transformValue;
          }
        }
      });
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="flex flex-col w-full h-screen bg-slate-900 text-white overflow-hidden">
      {/* Header / Controls */}
      <div className="h-16 flex items-center justify-between px-8 bg-slate-950 border-b border-slate-800 z-50">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          Pachelbel's Canon Visualizer
        </h1>
        <div className="space-x-4">
          {!isPlaying ? (
            <button
              onClick={start}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-full font-bold shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all"
            >
              START
            </button>
          ) : (
            <button
              onClick={stop}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-full font-bold transition-all"
            >
              STOP
            </button>
          )}
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="flex-1 relative flex flex-col justify-center gap-4">

        {/* Playhead Line */}
        <div
          ref={playheadRef}
          className="absolute top-0 bottom-0 w-1 bg-yellow-500 z-40 shadow-[0_0_10px_#eab308]"
          style={{ left: `${PLAYHEAD_X_PERCENT * 100}%` }}
        >
          <div className="absolute top-2 -left-3 text-xs text-yellow-500 font-mono">NOW</div>
        </div>

        {/* Lanes */}
        <div ref={el => { lanesRef.current[0] = el; }}>
          <Lane
            laneId={0}
            melody={canonMelody}
            offsetMeasure={0}
            pixelsPerSecond={PIXELS_PER_SECOND}
            activeNote={activeNotes[0]}
          />
        </div>
        <div ref={el => { lanesRef.current[1] = el; }}>
          <Lane
            laneId={1}
            melody={canonMelody}
            offsetMeasure={2}
            pixelsPerSecond={PIXELS_PER_SECOND}
            activeNote={activeNotes[1]}
          />
        </div>
        <div ref={el => { lanesRef.current[2] = el; }}>
          <Lane
            laneId={2}
            melody={canonMelody}
            offsetMeasure={4}
            pixelsPerSecond={PIXELS_PER_SECOND}
            activeNote={activeNotes[2]}
          />
        </div>

      </div>

      {/* Footer / Explanation */}
      <div className="p-4 text-center text-slate-500 text-sm">
        <p>Demonstration of a Canon (Round) - The same melody starts at different times.</p>
      </div>
    </div>
  );
};

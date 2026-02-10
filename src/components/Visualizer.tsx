import React from 'react';
import { Lane } from './Lane';
import { useCanonAudio } from '../hooks/useCanonAudio';

const PLAYHEAD_X_PERCENT = 0.3; // 30% from the left

export const Visualizer: React.FC = () => {
  const { isPlaying, start, stop, activeNotes } = useCanonAudio();

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
          className="absolute top-0 bottom-0 w-1 bg-yellow-500 z-40 shadow-[0_0_10px_#eab308]"
          style={{ left: `${PLAYHEAD_X_PERCENT * 100}%` }}
        >
          <div className="absolute top-2 -left-3 text-xs text-yellow-500 font-mono">NOW</div>
        </div>

        {/* Lanes - MIDI-driven visualization */}
        <Lane laneId={0} activeNote={activeNotes[0]} label="Violin I" />
        <Lane laneId={1} activeNote={activeNotes[1]} label="Violin II" />
        <Lane laneId={2} activeNote={activeNotes[2]} label="Violin III" />

      </div>

      {/* Footer / Explanation */}
      <div className="p-4 text-center text-slate-500 text-sm">
        <p>Demonstration of a Canon (Round) - Direct MIDI Playback with Visual Sync.</p>
      </div>
    </div>
  );
};

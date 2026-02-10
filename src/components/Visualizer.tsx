import React from 'react';
import { Lane } from './Lane';
import { useCanonAudio } from '../hooks/useCanonAudio';

const PIXELS_PER_SECOND = 100; // Adjust scrolling speed
const PLAYHEAD_X_PERCENT = 0.3; // 30% from the left

export const Visualizer: React.FC = () => {
  const { isPlaying, start, stop, currentTime, melodyTracks } = useCanonAudio();

  const playheadPixels = window.innerWidth * PLAYHEAD_X_PERCENT;

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
      <div className="flex-1 relative flex flex-col justify-center gap-0">

        {/* Playhead Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-yellow-500 z-40 shadow-[0_0_10px_#eab308]"
          style={{ left: `${PLAYHEAD_X_PERCENT * 100}%` }}
        >
          <div className="absolute top-2 -left-6 text-xs text-yellow-500 font-mono font-bold">
            NOW
          </div>
        </div>

        {/* Lanes - Conveyor belt visualization */}
        <Lane
          laneId={0}
          melody={melodyTracks[0]}
          currentTime={currentTime}
          label="Violin I"
          pixelsPerSecond={PIXELS_PER_SECOND}
          playheadPosition={playheadPixels}
        />
        <Lane
          laneId={1}
          melody={melodyTracks[1]}
          currentTime={currentTime}
          label="Violin II"
          pixelsPerSecond={PIXELS_PER_SECOND}
          playheadPosition={playheadPixels}
        />
        <Lane
          laneId={2}
          melody={melodyTracks[2]}
          currentTime={currentTime}
          label="Violin III"
          pixelsPerSecond={PIXELS_PER_SECOND}
          playheadPosition={playheadPixels}
        />
        <Lane
          laneId={3}
          melody={melodyTracks[3]}
          currentTime={currentTime}
          label="Bass"
          pixelsPerSecond={PIXELS_PER_SECOND}
          playheadPosition={playheadPixels}
        />

      </div>

      {/* Footer / Explanation */}
      <div className="p-4 text-center text-slate-500 text-sm">
        <p>Demonstrating Pachelbel's Canon - a musical round with staggered entries. Notes scroll to the NOW bar.</p>
      </div>
    </div>
  );
};

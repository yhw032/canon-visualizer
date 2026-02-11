import React from 'react';
import { Lane } from './Lane';
import { useCanonAudio } from '../hooks/useCanonAudio';

const PIXELS_PER_SECOND = 100; // Adjust scrolling speed
const PLAYHEAD_X_PERCENT = 0.3; // 30% from the left

export const Visualizer: React.FC = () => {
  const { isPlaying, start, stop, currentTime, melodyTracks } = useCanonAudio();

  const playheadPixels = window.innerWidth * PLAYHEAD_X_PERCENT;

  return (
    <div className="flex flex-col w-full h-screen bg-black text-stark-white overflow-hidden relative selection:bg-neon-lime selection:text-black">
      <div className="scanline" />

      {/* Header / Controls */}
      <div className="h-20 flex items-center justify-between px-12 border-b-2 border-stark-white z-50 bg-black">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">
          <span className="text-neon-lime">Pachelbel's</span> <span className="line-through decoration-neon-pink">Canon</span>
        </h1>
        <div className="flex gap-6">
          {!isPlaying ? (
            <button
              onClick={start}
              className="px-8 py-3 bg-neon-lime text-black font-black uppercase text-xl border-4 border-black hover:bg-black hover:text-neon-lime hover:border-neon-lime transition-all glitch-hover cursor-crosshair"
            >
              / START /
            </button>
          ) : (
            <button
              onClick={stop}
              className="px-8 py-3 bg-neon-pink text-black font-black uppercase text-xl border-4 border-black hover:bg-black hover:text-neon-pink hover:border-neon-pink transition-all glitch-hover cursor-crosshair"
            >
              [ STOP ]
            </button>
          )}
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="flex-1 relative flex flex-col justify-center gap-2 px-8 py-10" style={{ transform: 'skewY(-1deg)' }}>

        {/* Playhead Line - Jagged / Abstract */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-stark-white z-40 shadow-[0_0_15px_white]"
          style={{ left: `${PLAYHEAD_X_PERCENT * 100}%` }}
        >
          <div className="absolute top-4 -left-12 text-lg font-black bg-stark-white text-black px-2 py-1 -rotate-90 origin-right">
            EXECUTION
          </div>
          <div className="absolute bottom-4 -left-12 text-lg font-black bg-neon-lime text-black px-2 py-1 -rotate-90 origin-right">
            00:00:00
          </div>
          {/* Jagged elements */}
          <div className="absolute top-1/4 -left-4 w-8 h-[2px] bg-neon-cyan" />
          <div className="absolute top-2/4 -left-6 w-12 h-[2px] bg-neon-pink" />
          <div className="absolute top-3/4 -left-2 w-4 h-[2px] bg-neon-lime" />
        </div>

        {/* Lanes - Conveyor belt visualization */}
        {melodyTracks.map((track, i) => (
          <Lane
            key={i}
            laneId={i}
            melody={track}
            currentTime={currentTime}
            label={['VOICE_I', 'VOICE_II', 'VOICE_III', 'CONTINUO'][i]}
            pixelsPerSecond={PIXELS_PER_SECOND}
            playheadPosition={playheadPixels}
          />
        ))}

      </div>

      {/* Footer / Info */}
      <div className="p-6 border-t-2 border-stark-white bg-black z-50 flex justify-between items-center overflow-hidden">
        <div className="text-xs font-mono uppercase tracking-[0.5em] text-slate-500 animate-pulse">
          Digital Brutalism // Polyphony Glitch // Canon in D Major
        </div>
        <div className="text-xl font-black italic">
          {currentTime.toFixed(3)}s
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Lane } from './Lane';
import { useCanonAudio } from '../hooks/useCanonAudio';

const PIXELS_PER_SECOND = 100; // Adjust scrolling speed
const PLAYHEAD_X_PERCENT = 0.3; // 30% from the left

export const Visualizer: React.FC<{ theme: 'dark' | 'light'; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  const { isPlaying, start, stop, currentTime, melodyTracks, instrument, setInstrument, isLoading } = useCanonAudio();

  const playheadPixels = window.innerWidth * PLAYHEAD_X_PERCENT;

  const toggleInstrument = () => {
    setInstrument(prev => prev === 'strings' ? 'piano' : 'strings');
  };

  return (
    <div
      className="flex flex-col w-full h-screen overflow-hidden relative selection:bg-neon-lime selection:text-black transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div className="scanline" />

      {/* Header / Controls */}
      <div
        className="h-20 flex items-center justify-between px-12 border-b-2 z-50 transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-main)' }}
      >
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">
          <span style={{ color: 'var(--brand-primary)' }}>Pachelbel's</span> <span className="line-through" style={{ textDecorationColor: 'var(--brand-secondary)' }}>Canon</span>
        </h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={toggleInstrument}
            disabled={isLoading}
            className={`p-2 border-2 transition-all font-bold text-xs ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              borderColor: 'var(--border-main)',
              backgroundColor: instrument === 'piano' ? 'var(--text-primary)' : 'transparent',
              color: instrument === 'piano' ? 'var(--bg-primary)' : 'var(--text-primary)'
            }}
          >
            {isLoading ? '⌛ LOADING...' : (instrument === 'strings' ? '🎻 STRINGS' : '🎹 PIANO')}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 border-2 transition-all font-bold text-xs"
            style={{
              borderColor: 'var(--border-main)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)'
            }}
          >
            {theme === 'dark' ? 'LIGHT_MODE' : 'DARK_MODE'}
          </button>
          {!isPlaying ? (
            <button
              onClick={start}
              disabled={isLoading}
              className={`px-12 py-4 bg-neon-lime text-black font-black uppercase text-2xl border-4 border-text-primary hover:bg-bg-primary hover:text-neon-lime hover:border-neon-lime transition-all glitch-hover cursor-crosshair ${isLoading ? 'opacity-50 grayscale cursor-wait' : ''}`}
            >
              {isLoading ? 'BUFFRING AUDIO...' : '[ START ]'}
            </button>
          ) : (
            <button
              onClick={stop}
              className="px-8 py-3 bg-neon-pink text-black font-black uppercase text-xl border-4 transition-all glitch-hover cursor-crosshair"
              style={{ borderColor: 'var(--text-primary)' }}
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
          className="absolute top-0 bottom-0 w-[2px] z-40 transition-colors duration-300"
          style={{
            left: `${PLAYHEAD_X_PERCENT * 100}%`,
            backgroundColor: 'var(--text-primary)',
            boxShadow: '0 0 15px var(--text-primary)'
          }}
        >
          <div
            className="absolute top-4 -left-12 text-lg font-black px-2 py-1 -rotate-90 origin-right transition-colors duration-300"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          >
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
            label={['VOICE_I', 'VOICE_II', 'VOICE_III', 'VIOLA', 'CONTINUO'][i]}
            pixelsPerSecond={PIXELS_PER_SECOND}
            playheadPosition={playheadPixels}
            theme={theme}
          />
        ))}

      </div>

      {/* Footer / Info */}
      <div
        className="p-6 border-t-2 z-50 flex justify-between items-center overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-main)' }}
      >
        <div className="flex flex-col">
          <div
            className="text-xs font-mono uppercase tracking-[0.5em] animate-pulse"
            style={{ color: 'var(--text-secondary)' }}
          >
            Digital Brutalism // Polyphony Glitch // Canon in D Major
          </div>
          <div
            className="text-[10px] font-mono mt-1"
            style={{ color: 'var(--text-secondary)', opacity: 0.7 }}
          >
            Music: Canon in D (P.37) by Pachelbel | Arr. by jojo288 (CC BY 4.0)
          </div>
        </div>
        <div className="text-xl font-black italic">
          {currentTime.toFixed(3)}s
        </div>
      </div>
    </div>
  );
};

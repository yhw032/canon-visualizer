import React from 'react';

interface LaneProps {
  laneId: number;
  activeNote: string | null;
  label: string;
}

export const Lane: React.FC<LaneProps> = ({ laneId, activeNote, label }) => {
  return (
    <div className="relative w-full h-24 bg-slate-800/50 border-b border-slate-700 overflow-hidden">
      <div className="absolute left-4 top-1 text-slate-400 text-xs font-mono">
        {label}
      </div>

      {/* Active Note Display */}
      {activeNote && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-8 py-4 bg-gradient-to-r from-blue-500/20 to-teal-500/20 border-2 border-blue-400/50 rounded-lg backdrop-blur-sm animate-pulse">
            <span className="text-2xl font-bold text-blue-300">{activeNote}</span>
          </div>
        </div>
      )}

      {/* Background hint when no note */}
      {!activeNote && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <span className="text-slate-600 text-sm font-mono">Waiting...</span>
        </div>
      )}
    </div>
  );
};

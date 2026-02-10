import React, { memo } from 'react';
import clsx from 'clsx';

interface NoteBoxProps {
  note: string;
  width: number;
  left: number;
  isActive: boolean;
}

export const NoteBox: React.FC<NoteBoxProps> = memo(({ note, width, left, isActive }) => {
  return (
    <div
      className={clsx(
        "absolute top-1/2 -translate-y-1/2 h-12 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-100 border border-white/20",
        isActive
          ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.8)] scale-110 z-10"
          : "bg-blue-500/80 text-white shadow-sm hover:bg-blue-400"
      )}
      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
    >
      {note}
    </div>
  );
});

NoteBox.displayName = 'NoteBox';

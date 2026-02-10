import { useRef, useState, useCallback, useEffect } from 'react';
import * as mm from '@magenta/music';

export const useCanonAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useState<{ [laneId: number]: string | null }>({
    0: null,
    1: null,
    2: null,
  });

  const playerRef = useRef<mm.Player | null>(null);
  const sequenceRef = useRef<mm.INoteSequence | null>(null);

  // Load MIDI file
  useEffect(() => {
    const loadMidi = async () => {
      try {
        console.log('Loading MIDI file...');
        const sequence = await mm.urlToNoteSequence('/canon.mid');
        console.log('MIDI loaded:', sequence);
        sequenceRef.current = sequence;

        // Create player with note callbacks
        const player = new mm.Player(false, {
          run: (note: mm.NoteSequence.Note) => {
            // Map MIDI program/instrument to lanes
            // Assuming: program 40 = Violin for tracks 0,1,2
            const instrument = note.instrument || 0;

            if (instrument <= 2) {
              // Convert MIDI pitch to note name
              const noteName = mm.Midi.midiToNoteName(note.pitch);

              setActiveNotes(prev => ({
                ...prev,
                [instrument]: noteName
              }));

              // Clear note after duration
              setTimeout(() => {
                setActiveNotes(prev => {
                  if (prev[instrument] === noteName) {
                    return { ...prev, [instrument]: null };
                  }
                  return prev;
                });
              }, (note.endTime - note.startTime) * 1000 * 0.8);
            }
          },
          stop: () => {
            console.log('Playback stopped');
            setIsPlaying(false);
            setActiveNotes({ 0: null, 1: null, 2: null });
          }
        });

        playerRef.current = player;
        console.log('Player initialized');
      } catch (error) {
        console.error('Error loading MIDI:', error);
      }
    };

    loadMidi();

    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, []);

  const start = useCallback(async () => {
    if (playerRef.current && sequenceRef.current) {
      try {
        console.log('Starting playback...');
        playerRef.current.start(sequenceRef.current);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error starting playback:', error);
      }
    } else {
      console.warn('Player or sequence not ready');
    }
  }, []);

  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      setIsPlaying(false);
      setActiveNotes({ 0: null, 1: null, 2: null });
    }
  }, []);

  return { isPlaying, start, stop, activeNotes };
};

import { useRef, useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { canonMelody, type NoteData } from '../data/canonData';

export const useCanonAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useState<{ [laneId: number]: string | null }>({
    0: null,
    1: null,
    2: null,
  });

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const partsRef = useRef<Tone.Part[]>([]);

  // Initialize Synth
  useEffect(() => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 },
    }).toDestination();
    synth.volume.value = -6;
    synthRef.current = synth;

    return () => {
      synth.dispose();
    };
  }, []);

  const initAudio = useCallback(async () => {
    await Tone.start();
    Tone.Transport.bpm.value = 96; // Realistic Canon tempo (was 60, too slow)

    // Clear previous parts
    partsRef.current.forEach(part => part.dispose());
    partsRef.current = [];

    // Lane Offsets (in measures)
    // Part 1: 0 measures
    // Part 2: 2 measures  
    // Part 3: 4 measures
    const offsets = ["0:0:0", "2:0:0", "4:0:0"];

    offsets.forEach((offset, laneIndex) => {
      // Create a sequence for each lane
      const part = new Tone.Part<NoteData>((time, value) => {
        // Trigger Sound
        if (synthRef.current) {
          synthRef.current.triggerAttackRelease(value.note, value.duration, time);
        }

        // Trigger Visualization (Callback for React State)
        // Using "Draw" to sync with visual frame if needed, but setState is okay here for relatively slow updates
        Tone.Draw.schedule(() => {
          setActiveNotes(prev => ({ ...prev, [laneIndex]: value.note }));

          // Clear active note after duration (simplified approximation for visual highlight)
          // For exact duration, we might need a timeout or a secondary event
          const durationSeconds = Tone.Time(value.duration).toSeconds();
          setTimeout(() => {
            setActiveNotes(prev => {
              // Only clear if it's still the same note (simple check)
              if (prev[laneIndex] === value.note) {
                return { ...prev, [laneIndex]: null };
              }
              return prev;
            })
          }, durationSeconds * 1000 * 0.8); // 80% duration highlight
        }, time);

      }, canonMelody);

      part.start(offset);
      partsRef.current.push(part);
    });

  }, []);

  const start = async () => {
    if (Tone.Transport.state !== 'started') {
      await initAudio(); // Re-init parts to ensure clean slate
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    Tone.Transport.stop();
    // Stop all notes
    if (synthRef.current) {
      synthRef.current.releaseAll();
    }
    setIsPlaying(false);
    setActiveNotes({ 0: null, 1: null, 2: null });
  };

  return { isPlaying, start, stop, activeNotes };
};

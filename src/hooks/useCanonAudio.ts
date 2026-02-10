import { useRef, useState, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import MidiParser from 'midi-parser-js';

export const useCanonAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useState<{ [laneId: number]: string | null }>({
    0: null,
    1: null,
    2: null,
  });

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const partsRef = useRef<Tone.Part[]>([]);
  const midiDataRef = useRef<any>(null);

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

  // Load MIDI file
  useEffect(() => {
    const loadMidi = async () => {
      try {
        console.log('Loading MIDI file...');
        // Use BASE_URL to handle vite base path
        const midiUrl = `${import.meta.env.BASE_URL}canon.mid`;
        console.log('MIDI URL:', midiUrl);
        const response = await fetch(midiUrl);
        const arrayBuffer = await response.arrayBuffer();
        const midiData = MidiParser.parse(new Uint8Array(arrayBuffer));
        console.log('MIDI loaded:', midiData);
        midiDataRef.current = midiData;
      } catch (error) {
        console.error('Error loading MIDI:', error);
      }
    };

    loadMidi();
  }, []);

  const initAudio = useCallback(async () => {
    if (!midiDataRef.current || !synthRef.current) {
      console.warn('MIDI data or synth not ready');
      return;
    }

    await Tone.start();

    // Clear previous parts
    partsRef.current.forEach(part => part.dispose());
    partsRef.current = [];

    const midi = midiDataRef.current;
    const ppq = midi.timeDivision;

    console.log('MIDI Info:', {
      ppq,
      tracks: midi.track.length,
      timeDivision: midi.timeDivision
    });

    // Find tempo from MIDI file
    let microsecondsPerBeat = 500000; // Default 120 BPM
    if (midi.track[0]) {
      for (const event of midi.track[0].event) {
        if (event.type === 255 && event.data) {
          const metaType = event.data[0];
          if (metaType === 81) {
            // Set Tempo event (0x51 = 81)
            microsecondsPerBeat = (event.data[1] << 16) | (event.data[2] << 8) | event.data[3];
            break;
          }
        }
      }
    }
    const bpm = 60000000 / microsecondsPerBeat;
    console.log('MIDI BPM:', bpm);
    Tone.Transport.bpm.value = bpm;

    // Process all tracks (including bass)
    midi.track.forEach((track: any, trackIndex: number) => {
      const notes: any[] = [];
      let currentTicks = 0;

      track.event.forEach((event: any) => {
        currentTicks += event.deltaTime;

        if (event.type === 9 && event.data && event.data[0] > 0) {
          // Note on (velocity in data[0] for type 9)
          const pitch = event.data[0];
          const velocity = event.data[1] || 64;

          if (velocity === 0) return; // Note off disguised as note on

          const noteName = Tone.Frequency(pitch, 'midi').toNote();

          // Find corresponding note off
          let durationTicks = ppq / 2; // default half beat
          let tempTicks = currentTicks;

          for (let i = track.event.indexOf(event) + 1; i < track.event.length; i++) {
            const futureEvent = track.event[i];
            tempTicks += futureEvent.deltaTime;

            if ((futureEvent.type === 8 || (futureEvent.type === 9 && futureEvent.data && futureEvent.data[1] === 0))
              && futureEvent.data && futureEvent.data[0] === pitch) {
              durationTicks = tempTicks - currentTicks;
              break;
            }
          }

          const timeInBeats = currentTicks / ppq;
          const durationInBeats = durationTicks / ppq;

          notes.push({
            time: timeInBeats,
            note: noteName,
            duration: durationInBeats,
            velocity: velocity / 127
          });
        }
      });

      if (notes.length === 0) {
        console.log(`Track ${trackIndex}: No notes, skipping`);
        return;
      }

      console.log(`Track ${trackIndex}: ${notes.length} notes`);

      // Create Tone.Part for this track
      const part = new Tone.Part((time, value) => {
        if (synthRef.current) {
          synthRef.current.triggerAttackRelease(
            value.note,
            value.duration,
            time,
            value.velocity
          );
        }

        // Update visualization (only for first 3 violin tracks)
        if (trackIndex < 3) {
          Tone.Draw.schedule(() => {
            setActiveNotes(prev => ({ ...prev, [trackIndex]: value.note }));

            setTimeout(() => {
              setActiveNotes(prev => {
                if (prev[trackIndex] === value.note) {
                  return { ...prev, [trackIndex]: null };
                }
                return prev;
              });
            }, value.duration * 1000 * 0.8);
          }, time);
        }
      }, notes);

      part.start(0);
      part.loop = false;
      partsRef.current.push(part);
    });

    console.log('Total parts created:', partsRef.current.length);
  }, []);

  const start = useCallback(async () => {
    if (Tone.Transport.state !== 'started') {
      await initAudio();
      Tone.Transport.start();
      setIsPlaying(true);
    }
  }, [initAudio]);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    if (synthRef.current) {
      synthRef.current.releaseAll();
    }
    setIsPlaying(false);
    setActiveNotes({ 0: null, 1: null, 2: null });
  }, []);

  return { isPlaying, start, stop, activeNotes };
};

import { useRef, useState, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import MidiParser from 'midi-parser-js';

export interface NoteData {
  note: string;
  duration: number; // in beats
  time: number; // in beats
  velocity: number;
}

export const useCanonAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [melodyTracks, setMelodyTracks] = useState<NoteData[][]>([[], [], [], []]);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const partsRef = useRef<Tone.Part[]>([]);
  const midiDataRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);

  // Initialize Synth with FM synthesis for more violin-like sound
  useEffect(() => {
    const synth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01, // Slightly detuned for organic sound
      modulationIndex: 14,
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.4,
        release: 0.8
      },
      modulation: {
        type: 'square'
      },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.3,
        release: 0.5
      }
    }).toDestination();
    synth.volume.value = -8; // Slightly quieter for FM
    synthRef.current = synth;

    return () => {
      synth.dispose();
    };
  }, []);

  // Load MIDI file and extract notes
  useEffect(() => {
    const loadMidi = async () => {
      try {
        console.log('Loading MIDI file...');
        const midiUrl = `${import.meta.env.BASE_URL}canon.mid`;
        const response = await fetch(midiUrl);
        const arrayBuffer = await response.arrayBuffer();
        const midiData = MidiParser.parse(new Uint8Array(arrayBuffer));
        if (!midiData) {
          throw new Error('Failed to parse MIDI data');
        }
        console.log('MIDI loaded:', midiData);
        midiDataRef.current = midiData;

        // Extract notes from MIDI for visualization
        const extractedTracks: NoteData[][] = [[], [], [], []];
        const ppq = (midiData as any).timeDivision;

        // Process tracks 1-4 (Track 0 is metadata)
        (midiData as any).track.slice(1, 5).forEach((track: any, index: number) => {
          let currentTicks = 0;

          track.event.forEach((event: any) => {
            currentTicks += event.deltaTime;

            if (event.type === 9 && event.data && event.data[0] > 0) {
              const pitch = event.data[0];
              const velocity = event.data[1] || 64;

              if (velocity === 0) return;

              const noteName = Tone.Frequency(pitch, 'midi').toNote();

              // Find note off
              let durationTicks = ppq / 2;
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

              extractedTracks[index].push({
                time: currentTicks / ppq,
                note: noteName,
                duration: durationTicks / ppq,
                velocity: velocity / 127
              });
            }
          });
        });

        setMelodyTracks(extractedTracks);
        console.log('Tracks extracted:', extractedTracks.map((t, i) => `Lane ${i}: ${t.length} notes`));
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

    const parsedMidi = midiDataRef.current;

    // Find tempo
    let microsecondsPerBeat = 500000;
    if (parsedMidi && parsedMidi.track[0]) {
      for (const event of parsedMidi.track[0].event) {
        if (event.type === 255 && event.data && event.data[0] === 81) {
          microsecondsPerBeat = (event.data[1] << 16) | (event.data[2] << 8) | event.data[3];
          break;
        }
      }
    }
    const bpm = 60000000 / microsecondsPerBeat;
    console.log('MIDI BPM:', bpm);
    Tone.Transport.bpm.value = bpm;

    // Create playback parts for each track (tracks 1-4)
    melodyTracks.forEach((notes) => {
      if (notes.length === 0) return;

      const part = new Tone.Part((time, value) => {
        if (synthRef.current) {
          synthRef.current.triggerAttackRelease(
            value.note,
            value.duration,
            time,
            value.velocity
          );
        }
      }, notes);

      part.start(0);
      part.loop = false;
      partsRef.current.push(part);
    });

    console.log('Audio parts created:', partsRef.current.length);
  }, [melodyTracks]);

  // Animation loop for conveyor belt (throttled to ~60 FPS)
  const animate = useCallback(() => {
    if (Tone.Transport.state === 'started') {
      const now = performance.now();
      // Throttle to ~60 FPS (16.67ms per frame)
      if (now - lastUpdateTime.current >= 16) {
        setCurrentTime(Tone.Transport.seconds);
        lastUpdateTime.current = now;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, []);

  const start = useCallback(async () => {
    if (Tone.Transport.state !== 'started') {
      await initAudio();
      Tone.Transport.start();
      setIsPlaying(true);
      animate();
    }
  }, [initAudio, animate]);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    if (synthRef.current) {
      synthRef.current.releaseAll();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  return { isPlaying, start, stop, currentTime, melodyTracks };
};

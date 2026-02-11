import { useRef, useState, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import MidiParser from 'midi-parser-js';

export interface NoteData {
  note: string;
  duration: number; // in beats
  time: number; // in beats
  velocity: number;
}

export type InstrumentType = 'violin' | 'piano';

export const useCanonAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [melodyTracks, setMelodyTracks] = useState<NoteData[][]>([[], [], [], []]);
  const [instrument, setInstrument] = useState<InstrumentType>('violin');
  const [isPianoLoading, setIsPianoLoading] = useState(false);

  const synthRef = useRef<Tone.Sampler | Tone.PolySynth | null>(null);
  const partsRef = useRef<Tone.Part[]>([]);
  const midiDataRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);

  // Initialize/Update Synth based on instrument type
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.dispose();
      synthRef.current = null;
    }

    if (instrument === 'piano') {
      setIsPianoLoading(true);
      // High quality sampled piano using Tone.Sampler
      const sampler = new Tone.Sampler({
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          A6: "A6.mp3",
          C7: "C7.mp3",
          "D#7": "Ds7.mp3",
          "F#7": "Fs7.mp3",
          A7: "A7.mp3",
          C8: "C8.mp3"
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
          setIsPianoLoading(false);
          console.log('Piano samples loaded');
        },
        onerror: (err) => {
          setIsPianoLoading(false);
          console.error('Error loading piano samples:', err);
        }
      }).toDestination();
      sampler.volume.value = -4;
      synthRef.current = sampler;
    } else {
      // FM Synthesis for violin-like sound
      const violin = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.01,
        modulationIndex: 14,
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.4,
          release: 0.8
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.3,
          release: 0.5
        }
      }).toDestination();
      violin.volume.value = -8;
      synthRef.current = violin;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, [instrument]);

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

  return { isPlaying, start, stop, currentTime, melodyTracks, instrument, setInstrument, isPianoLoading };
};

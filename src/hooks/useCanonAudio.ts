import { useRef, useState, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import MidiParser from 'midi-parser-js';

export interface NoteData {
  note: string;
  duration: number; // in beats
  time: number; // in beats
  velocity: number;
}

export type InstrumentType = 'strings' | 'piano';

export const useCanonAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [melodyTracks, setMelodyTracks] = useState<NoteData[][]>([[], [], [], []]);
  const [instrument, setInstrument] = useState<InstrumentType>('strings');
  const [isLoading, setIsLoading] = useState(false);

  // Store active instruments (one per lane)
  const instrumentsRef = useRef<(Tone.Sampler | null)[]>([null, null, null, null]);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const partsRef = useRef<Tone.Part[]>([]);
  const midiDataRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);

  // Initialize/Update Instruments based on mode
  useEffect(() => {
    // Cleanup previous instruments and reverb
    instrumentsRef.current.forEach(inst => inst?.dispose());
    instrumentsRef.current = [null, null, null, null];
    if (reverbRef.current) {
      reverbRef.current.dispose();
      reverbRef.current = null;
    }

    const loadSampler = (urls: any, baseUrl: string, volume: number, attack: number, release: number): Promise<Tone.Sampler> => {
      return new Promise((resolve, reject) => {
        const sampler = new Tone.Sampler({
          urls,
          baseUrl,
          attack,
          release,
          onload: () => resolve(sampler),
          onerror: (err) => reject(err)
        });
        sampler.volume.value = volume;
      });
    };

    const initInstruments = async () => {
      setIsLoading(true);
      try {
        // Create professional Hall Reverb for blending
        const reverb = new Tone.Reverb({
          decay: 2.5,
          preDelay: 0.05,
          wet: 0.35 // 35% wet for a lush feel
        }).toDestination();
        await reverb.generate(); // Pre-generate the impulse response
        reverbRef.current = reverb;

        if (instrument === 'piano') {
          const piano = await loadSampler({
            A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
            A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
            A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
            A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
            A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
            A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
            A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
            A7: "A7.mp3", C8: "C8.mp3"
          }, "https://tonejs.github.io/audio/salamander/", -4, 0.01, 1.0);

          piano.connect(reverb);
          instrumentsRef.current = [piano, piano, piano, piano];
        } else {
          // Strings Ensemble (Lanes 0-2: Violin, Lane 3: Cello)
          const [violin, cello] = await Promise.all([
            loadSampler({
              A3: "A3.mp3", C4: "C4.mp3", E4: "E4.mp3", G4: "G4.mp3",
              A4: "A4.mp3", C5: "C5.mp3", E5: "E5.mp3", G5: "G5.mp3",
              A5: "A5.mp3", C6: "C6.mp3"
            }, "https://nbrosowsky.github.io/tonejs-instruments/samples/violin/", -2, 0.05, 1.5), // Lush release for legate
            loadSampler({
              A2: "A2.mp3", C2: "C2.mp3", E2: "E2.mp3", G2: "G2.mp3",
              A3: "A3.mp3", C3: "C3.mp3", E3: "E3.mp3", G3: "G3.mp3"
            }, "https://nbrosowsky.github.io/tonejs-instruments/samples/cello/", 0, 0.08, 1.8) // Even longer release for cello bass
          ]);

          violin.connect(reverb);
          cello.connect(reverb);
          instrumentsRef.current = [violin, violin, violin, cello];
        }
        console.log(`Instruments with Reverb loaded for ${instrument} mode`);
      } catch (err) {
        console.error('Error loading instruments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initInstruments();

    return () => {
      instrumentsRef.current.forEach(inst => inst?.dispose());
      reverbRef.current?.dispose();
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
    if (!midiDataRef.current || instrumentsRef.current.every(inst => inst === null)) {
      console.warn('MIDI data or instruments not ready');
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
    melodyTracks.forEach((notes, laneIndex) => {
      if (notes.length === 0) return;

      const part = new Tone.Part((time, value) => {
        const inst = instrumentsRef.current[laneIndex];
        if (inst) {
          inst.triggerAttackRelease(
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
    instrumentsRef.current.forEach(inst => inst?.releaseAll());
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  return { isPlaying, start, stop, currentTime, melodyTracks, instrument, setInstrument, isLoading };
};

declare module 'midi-parser-js' {
  interface MidiEvent {
    deltaTime: number;
    type: number;
    data?: number[];
  }

  interface MidiTrack {
    event: MidiEvent[];
  }

  interface MidiData {
    timeDivision: number;
    track: MidiTrack[];
  }

  export default class MidiParser {
    static parse(data: Uint8Array): MidiData | false;
  }
}

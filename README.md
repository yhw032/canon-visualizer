# 🎵 Canon Visualizer

A real-time interactive visualization of **Pachelbel's Canon in D Major** with MIDI playback.

## 🔗 [Live Demo](https://yhw032.github.io/canon-visualizer/)


## ✨ Features

- **🎹 Direct MIDI Playback** - Plays the full Canon using Tone.js from MIDI file
- **🎨 Pitch-Based Colors** - Notes are colored by pitch (blue=low, red=high)
- **📊 Conveyor Belt Visualization** - All notes scroll towards a "NOW" bar
- **🎻 Violin Sound** - FM synthesis creates organic, string-like tones
- **⚡ Performance Optimized** - Viewport culling keeps 60 FPS even with 3000+ notes
- **🎼 4-Part Canon** - Visualizes Violin I, II, III, and Bass simultaneously

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd canon-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/canon-visualizer/` in your browser.

### Build for Production

```bash
npm run build
```

## 🎮 How to Use

1. Click the **START** button
2. Watch as notes scroll from right to left
3. Notes light up and play when they reach the yellow **NOW** bar
4. Click **STOP** to pause playback

## 🎨 Color Guide

Notes are colored based on their pitch:

- 🔵 **Blue** - Low notes (D3-F4)
- 🟢 **Green/Yellow** - Mid notes (F#4-A5)
- 🔴 **Red** - High notes (A#5-D6)

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS v4 for styling

**Audio:**
- [Tone.js](https://tonejs.github.io/) - Web Audio framework
- [midi-parser-js](https://github.com/colxi/midi-parser-js) - MIDI file parsing
- FMSynth for violin-like sound

**Performance:**
- React.memo for component optimization
- Viewport culling (renders only ±15s of notes)
- 60 FPS throttled animation loop

## 📁 Project Structure

```
canon-visualizer/
├── public/
│   └── canon.mid               # MIDI file
├── src/
│   ├── components/
│   │   ├── Lane.tsx            # Individual instrument lane
│   │   └── Visualizer.tsx      # Main UI and NOW bar
│   ├── hooks/
│   │   └── useCanonAudio.ts    # MIDI parsing & playback
│   ├── types/
│   │   └── midi-parser-js.d.ts # TypeScript definitions
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

## 🎼 Music Theory

**Pachelbel's Canon** is a musical round where:
- The same melody is played by multiple voices
- Each voice starts at a different time (staggered entries)
  - Violin I: starts at 8 beats
  - Violin II: starts at 16 beats  
  - Violin III: starts at 24 beats
  - Bass: starts at 0 beats

This visualization makes these relationships visible!

## 🔧 Configuration

To customize the visualization, edit these values in `Visualizer.tsx`:

```typescript
const PIXELS_PER_SECOND = 100;  // Scroll speed
const PLAYHEAD_X_PERCENT = 0.3; // NOW bar position (30% from left)
```

## 🐛 Known Issues

- Some browsers may require user interaction before playing audio (Web Audio policy)
- Mobile devices not optimized

## 📝 License

MIT License - feel free to use this project for learning or inspiration!

## 🙏 Acknowledgments

- MIDI file: Pachelbel's Canon in D Major
- Inspired by classic music visualizers
- Built with modern web technologies

---

**Enjoy the visualization!** 🎶

If you have any questions or suggestions, feel free to open an issue.

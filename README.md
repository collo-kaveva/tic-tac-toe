# ⚡ Neon Tac — Arcade Tic Tac Toe

A polished, juicy arcade-style Tic Tac Toe built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS 4**. Runs at 60fps on desktop and mobile with a cohesive neon CRT visual theme, particle effects, screen shake, and satisfying animations.

![Neon Tac](https://img.shields.io/badge/status-playable-brightgreen) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)

---

## 🎮 Features

### Game Modes

| Mode | Description |
|------|-------------|
| **⚡ vs Computer** | Play against an AI opponent with three difficulty levels |
| **👥 2 Players** | Local pass-and-play multiplayer on the same device |

### AI Difficulty

| Level | Behavior |
|-------|----------|
| **Easy** | Mostly random moves; occasionally blocks your winning move (25% chance) |
| **Normal** | Always takes winning moves and blocks yours; favors center and corners with some randomness |
| **Hard** | Near-perfect play using minimax with alpha-beta pruning; tiny chance of an early mistake to keep things interesting |

### Core Gameplay Loop
- **3 lives** in vs Computer mode — lose a round, lose a life; game over at 0
- **Scoring system** with streak-based bonuses that scale with difficulty
- **Draws still award points** so every round feels worthwhile
- **Round-over screen** between each game showing points earned and current streak
- **Instant restart** — jump back in immediately from any game-over or pause screen

### Scoring Breakdown

| Event | Easy | Normal | Hard |
|-------|------|--------|------|
| Win (base) | 80 pts | 120 pts | 180 pts |
| Streak bonus | +25 per consecutive win (max 8×) | +25 per consecutive win (max 8×) | +25 per consecutive win (max 8×) |
| Draw | 10 pts | 25 pts | 40 pts |
| Loss | 0 pts (streak resets) | 0 pts (streak resets) | 0 pts (streak resets) |

### Juice & Polish
- 🎆 **Particle bursts** on every move — cyan sparks for X, magenta for O
- 🎊 **Confetti rain** on wins with multi-colored particles
- 📳 **Screen shake** that scales with impact — gentle taps on placement, heavy rumble on wins/losses
- 💥 **Screen flash** — green for wins, amber for draws, magenta for losses
- ✨ **Mark pop-in animations** with springy overshoot
- 🟢 **Animated win line** that draws across the winning three cells
- 🌀 **Board breathing glow** that shifts between cyan and magenta
- 📺 **CRT scanlines and vignette** for retro atmosphere
- 🌈 **Shimming gradient title** on the start screen

### Controls

| Input | Action |
|-------|--------|
| **Tap / Click** | Place mark on a cell |
| **1–9 keys** | Directly place mark on numbered cell |
| **Arrow keys / WASD** | Navigate focus between cells |
| **Enter / Space** | Confirm placement at focused cell |
| **Esc / P** | Pause / resume |
| **R** | Restart run (from pause or game-over) |
| **M** | Return to main menu (from game-over) |

### Persistence
- **Local high-score table** stored in `localStorage` (top 8 entries)
- Tracks player name, score, best streak, wins, difficulty, and date
- Name entry prompt when you qualify for the leaderboard

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev) | 19.2 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety |
| [Vite](https://vite.dev) | 7.3 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4.1 | Utility-first styling |
| [vite-plugin-singlefile](https://github.com/niccolozy/vite-plugin-singlefile) | 2.3 | Bundles everything into a single `index.html` |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | — | Conditional class merging |

**No external game engines, canvas, or animation libraries** — all effects are pure CSS animations and lightweight React state.

---

## 📂 Project Structure

```
├── index.html                  # HTML entry point
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite + Tailwind + singlefile plugin
│
├── src/
│   ├── main.tsx                # React DOM entry — renders <App />
│   ├── App.tsx                 # Root component — full game state machine
│   ├── index.css               # Tailwind imports, theme tokens, CSS animations
│   │
│   ├── game/                   # Pure game logic (no React)
│   │   ├── types.ts            # Type definitions, constants, interfaces
│   │   ├── logic.ts            # Board rules, AI (minimax), scoring
│   │   └── highScores.ts       # localStorage CRUD for leaderboard
│   │
│   ├── components/             # React UI components
│   │   ├── Board.tsx           # 3×3 grid, cells, marks, win-line SVG
│   │   ├── Hud.tsx             # Score display, round info, lives, pause button
│   │   ├── Overlays.tsx        # Start screen, pause, round-over, game-over modals
│   │   └── Particles.tsx       # Particle system (burst + confetti generators)
│   │
│   └── utils/
│       └── cn.ts               # clsx + tailwind-merge helper
```

### Architecture Notes

- **`App.tsx`** acts as a state machine cycling through phases: `start → playing → paused | roundOver → playing → gameOver → start`
- Game logic in `src/game/` is **pure TypeScript** with no React dependencies — easy to test or reuse
- The AI uses **minimax with alpha-beta pruning** for the Hard difficulty and simpler heuristics for Easy/Normal
- All visual effects (particles, shake, flash) use React state + CSS animations for GPU-accelerated 60fps performance
- Refs (`boardRef`, `currentPlayerRef`, `scoreRef`, etc.) ensure callbacks always read the latest state without stale closures

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` with hot module replacement.

### Production Build

```bash
npm run build
```

Outputs a **single self-contained `dist/index.html`** (~256 KB, ~76 KB gzipped) thanks to `vite-plugin-singlefile`. No additional assets to deploy — just serve the one file.

### Preview Build

```bash
npm run preview
```

Serves the production build locally for testing.

---

## 🎯 How to Play

1. **Choose your mode** — vs Computer or 2 Players
2. **Select difficulty** (for AI mode) — Easy, Normal, or Hard
3. **Press Start** or hit Enter
4. **Place marks** by tapping cells or using keyboard shortcuts (1–9, arrows + Enter)
5. **Chain wins** to build your streak multiplier for higher scores
6. **Survive** — in AI mode you have 3 lives; lose them all and the run ends
7. **Enter your name** if you make the leaderboard!

### Tips
- In **Hard** mode, the AI plays near-perfectly — look for the rare early mistake to gain an edge
- **Streak bonuses** cap at 8× but stack significantly — a 5-win streak on Hard is worth 305 points per win
- **Draws on Hard** give 40 points, so stalemates are still valuable when facing a tough AI
- Use **number keys** for the fastest input — each key maps directly to a cell position

---

## 🎨 Visual Theme

The game uses a **neon arcade / CRT** aesthetic:

| Token | Color | Usage |
|-------|-------|-------|
| `--color-neon-cyan` | `#22f0ff` | Player X marks, primary accents |
| `--color-neon-magenta` | `#ff2bd6` | Player O marks, lives, danger states |
| `--color-neon-lime` | `#b8ff3c` | Wins, win lines, streak highlights |
| `--color-neon-amber` | `#ffc14a` | Draws, round info, difficulty badge |
| `--color-void` | `#07060f` | Deep dark background |
| `--color-panel` | `#12101f` | Card / board background |

---

## 📱 Mobile Support

- Fully responsive layout using `clamp()`, viewport units, and `max-w-[min(92vw,420px)]`
- `touch-action: manipulation` prevents double-tap zoom delays
- `-webkit-tap-highlight-color: transparent` removes tap flash
- Safe area insets respected for notched devices
- Footer text adapts between desktop keyboard hints and mobile tap hints

---

## 📄 License

This project is provided as-is for educational and personal use.

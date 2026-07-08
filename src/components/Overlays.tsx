import { FormEvent, useState } from "react";
import { Difficulty, GameMode, HighScoreEntry, ScoreState } from "../game/types";
import { difficultyLabel, formatDate } from "../game/highScores";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

function Panel({ children, className = "" }: PanelProps) {
  return (
    <div
      className={`w-full max-w-md rounded-3xl border border-white/15 bg-[#0d0b18]/95 p-6 shadow-[0_0_60px_rgba(34,240,255,0.12)] backdrop-blur-xl animate-float-in ${className}`}
    >
      {children}
    </div>
  );
}

function NeonButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const styles =
    variant === "primary"
      ? "border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 shadow-[0_0_24px_rgba(34,240,255,0.2)]"
      : variant === "danger"
        ? "border-neon-magenta/40 bg-neon-magenta/15 text-neon-magenta hover:bg-neon-magenta/25"
        : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-wider transition active:scale-[0.97] disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

interface StartScreenProps {
  highScores: HighScoreEntry[];
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  gameMode: GameMode;
  onGameMode: (m: GameMode) => void;
  onStart: () => void;
}

const MODE_LABELS: Record<GameMode, string> = {
  ai: "⚡ vs Computer",
  human: "👥 2 Players",
};

export function StartScreen({
  highScores,
  difficulty,
  onDifficulty,
  gameMode,
  onGameMode,
  onStart,
}: StartScreenProps) {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-8">
      <Panel>
        <p className="text-center text-[11px] uppercase tracking-[0.35em] text-neon-magenta/80">
          Arcade Mode
        </p>
        <h1 className="title-gradient mt-2 text-center text-5xl font-black tracking-tight sm:text-6xl">
          NEON TAC
        </h1>
        <p className="mt-3 text-center text-sm text-white/55">
          {gameMode === "ai"
            ? "Beat the AI. Chain wins. Chase the high score."
            : "Pass-and-play with a friend. Chain wins. Chase the high score."}
          <br />
          <span className="text-white/35">
            Tap or press 1–9 · arrows + Enter · Esc pause
          </span>
        </p>

        {/* Game Mode */}
        <div className="mt-6">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-white/40">
            Game Mode
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["ai", "human"] as GameMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onGameMode(m)}
                className={`rounded-xl border px-2 py-3 text-xs font-bold uppercase tracking-wider transition ${
                  gameMode === m
                    ? "border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan shadow-[0_0_18px_rgba(34,240,255,0.2)]"
                    : "border-white/10 bg-black/30 text-white/55 hover:border-white/20"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty (only relevant for AI mode) */}
        <div className={`mt-4 transition-opacity ${gameMode === "human" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-white/40">
            AI Difficulty
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                disabled={gameMode === "human"}
                onClick={() => onDifficulty(d)}
                className={`rounded-xl border px-2 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  difficulty === d
                    ? "border-neon-lime/50 bg-neon-lime/15 text-neon-lime shadow-[0_0_18px_rgba(184,255,60,0.2)]"
                    : "border-white/10 bg-black/30 text-white/55 hover:border-white/20"
                }`}
              >
                {difficultyLabel(d)}
              </button>
            ))}
          </div>
        </div>

        <NeonButton onClick={onStart} className="mt-6 w-full text-base py-3.5 animate-pulse-glow">
          Press Start
        </NeonButton>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-white/40">
              Local High Scores
            </p>
            <p className="text-[10px] text-white/25">Top 8</p>
          </div>
          {highScores.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-3 py-6 text-center text-sm text-white/35">
              No scores yet — claim the board.
            </p>
          ) : (
            <ul className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
              {highScores.map((entry, i) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-black/30 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 shrink-0 font-black tabular-nums ${
                        i === 0
                          ? "text-neon-amber"
                          : i === 1
                            ? "text-white/70"
                            : i === 2
                              ? "text-neon-magenta/80"
                              : "text-white/35"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate font-semibold text-white/90">
                      {entry.name}
                    </span>
                    <span className="shrink-0 text-[10px] uppercase text-white/30">
                      {difficultyLabel(entry.difficulty)}
                    </span>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <p className="font-bold tabular-nums text-neon-cyan">
                      {entry.score.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>
    </div>
  );
}

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ onResume, onRestart, onQuit }: PauseOverlayProps) {
  return (
    <OverlayScrim>
      <Panel className="text-center">
        <h2 className="text-3xl font-black tracking-wide text-white">Paused</h2>
        <p className="mt-2 text-sm text-white/45">Esc or P to resume</p>
        <div className="mt-6 flex flex-col gap-2">
          <NeonButton onClick={onResume}>Resume</NeonButton>
          <NeonButton variant="ghost" onClick={onRestart}>
            Restart Run
          </NeonButton>
          <NeonButton variant="danger" onClick={onQuit}>
            Quit to Menu
          </NeonButton>
        </div>
      </Panel>
    </OverlayScrim>
  );
}

interface RoundOverProps {
  result: "win" | "loss" | "draw";
  pointsGained: number;
  score: ScoreState;
  gameMode: GameMode;
  onContinue: () => void;
}

export function RoundOverOverlay({
  result,
  pointsGained,
  score,
  gameMode,
  onContinue,
}: RoundOverProps) {
  const title =
    result === "win"
      ? gameMode === "human"
        ? "Player Wins!"
        : "You Win!"
      : result === "loss"
        ? "AI Strikes"
        : "Draw";
  const color =
    result === "win"
      ? "text-neon-lime"
      : result === "loss"
        ? "text-neon-magenta"
        : "text-neon-amber";

  return (
    <OverlayScrim>
      <Panel className="text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
          Round {score.round}
        </p>
        <h2 className={`mt-1 text-4xl font-black ${color}`}>{title}</h2>
        <p className="mt-3 text-2xl font-black tabular-nums text-white">
          {pointsGained > 0 ? `+${pointsGained}` : pointsGained}{" "}
          <span className="text-sm font-semibold text-white/40">pts</span>
        </p>
        <p className="mt-1 text-sm text-white/45">
          Streak {score.streak}× · Total {score.score.toLocaleString()}
        </p>
        <NeonButton onClick={onContinue} className="mt-6 w-full">
          Next Round · Enter
        </NeonButton>
      </Panel>
    </OverlayScrim>
  );
}

interface GameOverProps {
  score: ScoreState;
  difficulty: Difficulty;
  isHighScore: boolean;
  onSave: (name: string) => void;
  onRestart: () => void;
  onMenu: () => void;
}

export function GameOverOverlay({
  score,
  difficulty,
  isHighScore,
  onSave,
  onRestart,
  onMenu,
}: GameOverProps) {
  const [name, setName] = useState("ACE");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (saved) return;
    onSave(name.trim().slice(0, 12) || "ACE");
    setSaved(true);
  };

  return (
    <OverlayScrim>
      <Panel className="text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-neon-magenta/70">
          Game Over
        </p>
        <h2 className="title-gradient mt-1 text-4xl font-black">Run Complete</h2>
        <p className="mt-4 text-5xl font-black tabular-nums text-white">
          {score.score.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-white/45">
          {score.wins}W · {score.losses}L · {score.draws}D · Best streak{" "}
          {score.bestStreak}× · {difficultyLabel(difficulty)}
        </p>

        {isHighScore && !saved && (
          <form onSubmit={handleSubmit} className="mt-5 text-left">
            <label className="text-[10px] uppercase tracking-widest text-neon-amber">
              New high score — enter name
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                maxLength={12}
                className="min-w-0 flex-1 rounded-xl border border-neon-amber/40 bg-black/50 px-3 py-2.5 font-bold tracking-widest text-neon-amber outline-none focus:ring-2 focus:ring-neon-amber/40"
                autoFocus
                aria-label="Player name"
              />
              <NeonButton type="submit" className="shrink-0">
                Save
              </NeonButton>
            </div>
          </form>
        )}
        {saved && (
          <p className="mt-4 text-sm font-semibold text-neon-lime">
            Score locked into the hall of fame.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <NeonButton onClick={onRestart}>Play Again · R</NeonButton>
          <NeonButton variant="ghost" onClick={onMenu}>
            Main Menu
          </NeonButton>
        </div>
      </Panel>
    </OverlayScrim>
  );
}

function OverlayScrim({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
      {children}
    </div>
  );
}

interface TurnBannerProps {
  message: string;
  accent?: "cyan" | "magenta" | "lime" | "amber";
}

export function TurnBanner({ message, accent = "cyan" }: TurnBannerProps) {
  const colors = {
    cyan: "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10",
    magenta: "text-neon-magenta border-neon-magenta/30 bg-neon-magenta/10",
    lime: "text-neon-lime border-neon-lime/30 bg-neon-lime/10",
    amber: "text-neon-amber border-neon-amber/30 bg-neon-amber/10",
  };
  return (
    <div
      className={`mx-auto mb-3 w-fit rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${colors[accent]}`}
    >
      {message}
    </div>
  );
}

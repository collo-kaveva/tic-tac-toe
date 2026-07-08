import { Difficulty, GameMode, ScoreState } from "../game/types";
import { difficultyLabel } from "../game/highScores";

interface HudProps {
  score: ScoreState;
  difficulty: Difficulty;
  gameMode: GameMode;
  lives: number;
  onPause: () => void;
  canPause: boolean;
}

export function Hud({ score, difficulty, gameMode, lives, onPause, canPause }: HudProps) {
  return (
    <header className="w-full max-w-lg mx-auto px-1 mb-4 animate-float-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-neon-cyan/70">
            Neon Tac
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tabular-nums text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
              {score.score.toLocaleString()}
            </span>
            <span className="text-xs text-white/40">PTS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/40">
              Round {score.round}
            </p>
            <p className="text-sm font-semibold text-neon-amber">
              {difficultyLabel(difficulty)}
            </p>
          </div>
          <button
            type="button"
            onClick={onPause}
            disabled={!canPause}
            className="h-11 w-11 rounded-2xl border border-white/15 bg-white/5 text-lg font-bold text-white/80 transition hover:bg-white/10 active:scale-95 disabled:opacity-40"
            aria-label="Pause game"
          >
            ‖
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Stat label="Streak" value={`${score.streak}×`} accent="text-neon-lime" />
          <Stat label="W-L-D" value={`${score.wins}-${score.losses}-${score.draws}`} />
        </div>
        {gameMode === "ai" ? (
          <div className="flex items-center gap-1.5" aria-label={`${lives} lives remaining`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`inline-block h-2.5 w-2.5 rounded-full transition-all ${
                  i < lives
                    ? "bg-neon-magenta shadow-[0_0_10px_rgba(255,43,214,0.9)]"
                    : "bg-white/15"
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/30 px-2.5 py-1.5">
            <p className="text-[9px] uppercase tracking-widest text-white/35">Mode</p>
            <p className="font-bold text-neon-magenta/90">2 Players</p>
          </div>
        )}
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-2.5 py-1.5">
      <p className="text-[9px] uppercase tracking-widest text-white/35">{label}</p>
      <p className={`font-bold tabular-nums ${accent ?? "text-white/90"}`}>{value}</p>
    </div>
  );
}

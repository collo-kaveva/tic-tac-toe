import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Board } from "./components/Board";
import { Hud } from "./components/Hud";
import {
  GameOverOverlay,
  PauseOverlay,
  RoundOverOverlay,
  StartScreen,
  TurnBanner,
} from "./components/Overlays";
import {
  Particles,
  spawnBurst,
  spawnConfetti,
} from "./components/Particles";
import {
  checkWinner,
  getAiMove,
  isBoardFull,
  placeMark,
  scoreForDraw,
  scoreForWin,
} from "./game/logic";
import {
  loadHighScores,
  qualifiesForHighScore,
  saveHighScore,
} from "./game/highScores";
import {
  Board as BoardType,
  Difficulty,
  EMPTY_BOARD,
  GameMode,
  GamePhase,
  HighScoreEntry,
  INITIAL_SCORE,
  Particle,
  Player,
  ScoreState,
} from "./game/types";

const LIVES_START = 3;
const AI_DELAY_MS = 320;
const PLAYER: Player = "X";
const AI: Player = "O";

const X_COLORS = ["#22f0ff", "#7af7ff", "#ffffff", "#b8ff3c"];
const O_COLORS = ["#ff2bd6", "#ff7ae8", "#ffffff", "#ffc14a"];
const WIN_COLORS = ["#b8ff3c", "#22f0ff", "#ff2bd6", "#ffc14a", "#ffffff"];

export default function App() {
  const [phase, setPhase] = useState<GamePhase>("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [gameMode, setGameMode] = useState<GameMode>("ai");
  const [board, setBoard] = useState<BoardType>([...EMPTY_BOARD]);
  const [focusIndex, setFocusIndex] = useState(4);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYER);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [score, setScore] = useState<ScoreState>({ ...INITIAL_SCORE });
  const [lives, setLives] = useState(LIVES_START);
  const [roundResult, setRoundResult] = useState<"win" | "loss" | "draw" | null>(
    null
  );
  const [pointsGained, setPointsGained] = useState(0);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(() =>
    loadHighScores()
  );
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shake, setShake] = useState({ x: 0, y: 0 });
  const [flash, setFlash] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("Your move");

  const rootRef = useRef<HTMLDivElement>(null);
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const aiTimerRef = useRef<number | null>(null);
  const particleTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  const boardRef = useRef(board);
  const currentPlayerRef = useRef(currentPlayer);
  const processingRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    boardRef.current = board;
  }, [board]);
  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  const clearAiTimer = useCallback(() => {
    if (aiTimerRef.current !== null) {
      window.clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  }, []);

  const triggerShake = useCallback((intensity = 8, duration = 220) => {
    if (shakeTimerRef.current) window.clearInterval(shakeTimerRef.current);
    const start = performance.now();
    shakeTimerRef.current = window.setInterval(() => {
      const t = performance.now() - start;
      if (t >= duration) {
        if (shakeTimerRef.current) window.clearInterval(shakeTimerRef.current);
        shakeTimerRef.current = null;
        setShake({ x: 0, y: 0 });
        return;
      }
      const decay = 1 - t / duration;
      setShake({
        x: (Math.random() - 0.5) * intensity * 2 * decay,
        y: (Math.random() - 0.5) * intensity * 2 * decay,
      });
    }, 16);
  }, []);

  const triggerFlash = useCallback((color: string) => {
    setFlash(color);
    window.setTimeout(() => setFlash(null), 280);
  }, []);

  const addParticles = useCallback((next: Particle[]) => {
    setParticles((prev) => [...prev, ...next].slice(-120));
    const maxLife = Math.max(...next.map((p) => p.life), 600);
    if (particleTimerRef.current) window.clearTimeout(particleTimerRef.current);
    particleTimerRef.current = window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => Date.now() - p.id < p.life + 50));
    }, maxLife + 80);
  }, []);

  const burstAtCell = useCallback(
    (index: number, colors: string[], count = 16) => {
      const wrap = boardWrapRef.current;
      if (!wrap) {
        const rect = rootRef.current?.getBoundingClientRect();
        const cx = (rect?.width ?? 300) / 2;
        const cy = (rect?.height ?? 400) / 2;
        addParticles(spawnBurst(cx, cy, colors, count));
        return;
      }
      const rect = wrap.getBoundingClientRect();
      const col = index % 3;
      const row = Math.floor(index / 3);
      const cellW = rect.width / 3;
      const cellH = rect.height / 3;
      const x = rect.left + cellW * (col + 0.5) - (rootRef.current?.getBoundingClientRect().left ?? 0);
      const y = rect.top + cellH * (row + 0.5) - (rootRef.current?.getBoundingClientRect().top ?? 0);
      addParticles(spawnBurst(x, y, colors, count));
    },
    [addParticles]
  );

  const resetRound = useCallback((nextRound?: number) => {
    clearAiTimer();
    processingRef.current = false;
    setBoard([...EMPTY_BOARD]);
    setFocusIndex(4);
    setCurrentPlayer(PLAYER);
    setWinningLine(null);
    setLastMove(null);
    setRoundResult(null);
    setPointsGained(0);
    setStatusMsg(gameMode === "human" ? "Player 1" : "Your move");
    setPhase("playing");
    if (typeof nextRound === "number") {
      setScore((s) => ({ ...s, round: nextRound }));
    }
  }, [clearAiTimer, gameMode]);

  const startRun = useCallback(() => {
    clearAiTimer();
    setScore({ ...INITIAL_SCORE });
    setLives(LIVES_START);
    setParticles([]);
    setHighScores(loadHighScores());
    resetRound(1);
  }, [clearAiTimer, resetRound]);

  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  const finishRound = useCallback(
    (
      result: "win" | "loss" | "draw",
      line: number[] | null,
      moveIndex: number
    ) => {
      processingRef.current = true;
      setWinningLine(line);
      setRoundResult(result);

      const currentScore = scoreRef.current;
      let gained = 0;
      let nextScore = { ...currentScore };
      let nextLives = livesRef.current;

      if (result === "win") {
        const streak = currentScore.streak + 1;
        gained = scoreForWin(streak, difficulty);
        nextScore = {
          ...currentScore,
          score: currentScore.score + gained,
          streak,
          bestStreak: Math.max(currentScore.bestStreak, streak),
          wins: currentScore.wins + 1,
        };
        setStatusMsg("Perfect line!");
        triggerShake(12, 320);
        triggerFlash("rgba(184,255,60,0.35)");
        const root = rootRef.current?.getBoundingClientRect();
        addParticles(
          spawnConfetti(root?.width ?? 400, root?.height ?? 700, 48)
        );
        if (line) {
          line.forEach((i) => burstAtCell(i, WIN_COLORS, 10));
        }
      } else if (result === "draw") {
        gained = scoreForDraw(difficulty);
        nextScore = {
          ...currentScore,
          score: currentScore.score + gained,
          draws: currentScore.draws + 1,
        };
        setStatusMsg("Stalemate");
        triggerShake(5, 180);
        triggerFlash("rgba(255,193,74,0.25)");
      } else {
        gained = 0;
        nextLives = livesRef.current - 1;
        nextScore = {
          ...currentScore,
          streak: 0,
          losses: currentScore.losses + 1,
        };
        setLives(nextLives);
        setStatusMsg("Life lost");
        triggerShake(16, 380);
        triggerFlash("rgba(255,43,214,0.4)");
        burstAtCell(moveIndex, O_COLORS, 22);
      }

      setScore(nextScore);
      scoreRef.current = nextScore;
      livesRef.current = nextLives;
      setPointsGained(gained);

      window.setTimeout(() => {
        if (result === "loss" && nextLives <= 0) {
          setPhase("gameOver");
        } else {
          setPhase("roundOver");
        }
      }, result === "win" ? 700 : 520);
    },
    [addParticles, burstAtCell, difficulty, triggerFlash, triggerShake]
  );

  const applyMove = useCallback(
    (index: number, player: Player) => {
      if (processingRef.current) return;
      if (phaseRef.current !== "playing") return;
      if (boardRef.current[index] !== null) return;
      if (currentPlayerRef.current !== player) return;

      const nextBoard = placeMark(boardRef.current, index, player);
      boardRef.current = nextBoard;
      setBoard(nextBoard);
      setLastMove(index);
      setFocusIndex(index);

      if (player === PLAYER) {
        burstAtCell(index, X_COLORS, 14);
        triggerShake(4, 100);
      } else {
        burstAtCell(index, O_COLORS, 14);
        triggerShake(5, 120);
      }

      const { winner, line } = checkWinner(nextBoard);
      if (winner) {
        // In human mode, any winner is a "win"; in AI mode, only X is a win
        const result: "win" | "loss" =
          gameMode === "human" || winner === PLAYER ? "win" : "loss";
        finishRound(result, line, index);
        return;
      }
      if (isBoardFull(nextBoard)) {
        finishRound("draw", null, index);
        return;
      }

      const nextPlayer: Player = player === PLAYER ? AI : PLAYER;
      currentPlayerRef.current = nextPlayer;
      setCurrentPlayer(nextPlayer);
      if (gameMode === "human") {
        setStatusMsg(nextPlayer === PLAYER ? "Player 1" : "Player 2");
      } else {
        setStatusMsg(nextPlayer === PLAYER ? "Your move" : "AI thinking…");
      }
    },
    [burstAtCell, finishRound, gameMode, triggerShake]
  );

  // AI turn (skip in human mode)
  useEffect(() => {
    if (gameMode !== "ai") return;
    if (phase !== "playing") return;
    if (currentPlayer !== AI) return;
    if (winningLine) return;

    clearAiTimer();
    aiTimerRef.current = window.setTimeout(() => {
      const move = getAiMove(boardRef.current, difficulty, AI, PLAYER);
      applyMove(move, AI);
    }, AI_DELAY_MS);

    return clearAiTimer;
  }, [gameMode, phase, currentPlayer, difficulty, applyMove, clearAiTimer, winningLine]);

  const handleCellSelect = useCallback(
    (index: number) => {
      if (phase !== "playing") return;
      if (gameMode === "ai" && currentPlayer !== PLAYER) return;
      applyMove(index, currentPlayer);
    },
    [applyMove, currentPlayer, gameMode, phase]
  );

  const handlePause = useCallback(() => {
    if (phase === "playing") {
      clearAiTimer();
      setPhase("paused");
    }
  }, [clearAiTimer, phase]);

  const handleResume = useCallback(() => {
    if (phase === "paused") setPhase("playing");
  }, [phase]);

  const handleContinueRound = useCallback(() => {
    resetRound(score.round + 1);
  }, [resetRound, score.round]);

  const handleRestart = useCallback(() => {
    startRun();
  }, [startRun]);

  const handleQuit = useCallback(() => {
    clearAiTimer();
    setPhase("start");
    setBoard([...EMPTY_BOARD]);
    setParticles([]);
    setHighScores(loadHighScores());
  }, [clearAiTimer]);

  const handleSaveScore = useCallback(
    (name: string) => {
      const updated = saveHighScore({
        name,
        score: score.score,
        streak: score.bestStreak,
        wins: score.wins,
        difficulty,
      });
      setHighScores(updated);
    },
    [difficulty, score]
  );

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const p = phaseRef.current;

      if (p === "start") {
        if (key === "enter" || key === " ") {
          e.preventDefault();
          startRun();
        }
        if (key === "1") setDifficulty("easy");
        if (key === "2") setDifficulty("normal");
        if (key === "3") setDifficulty("hard");
        return;
      }

      if (p === "paused") {
        if (key === "escape" || key === "p" || key === "enter") {
          e.preventDefault();
          setPhase("playing");
        }
        if (key === "r") {
          e.preventDefault();
          startRun();
        }
        return;
      }

      if (p === "roundOver") {
        if (key === "enter" || key === " " || key === "n") {
          e.preventDefault();
          handleContinueRound();
        }
        return;
      }

      if (p === "gameOver") {
        if (key === "r") {
          e.preventDefault();
          startRun();
        }
        if (key === "escape" || key === "m") {
          e.preventDefault();
          handleQuit();
        }
        return;
      }

      if (p !== "playing") return;

      if (key === "escape" || key === "p") {
        e.preventDefault();
        handlePause();
        return;
      }

      if (currentPlayerRef.current !== PLAYER || processingRef.current) return;

      // Number keys 1-9
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const idx = Number(e.key) - 1;
        setFocusIndex(idx);
        handleCellSelect(idx);
        return;
      }

      // Arrow / WASD navigation
      const moves: Record<string, number> = {
        arrowup: -3,
        w: -3,
        arrowdown: 3,
        s: 3,
        arrowleft: -1,
        a: -1,
        arrowright: 1,
        d: 1,
      };
      if (key in moves) {
        e.preventDefault();
        setFocusIndex((prev) => {
          let next = prev + moves[key];
          // Prevent wrapping oddly across rows for left/right
          if ((key === "arrowleft" || key === "a") && prev % 3 === 0) return prev;
          if ((key === "arrowright" || key === "d") && prev % 3 === 2) return prev;
          if (next < 0 || next > 8) return prev;
          return next;
        });
        return;
      }

      if (key === "enter" || key === " ") {
        e.preventDefault();
        handleCellSelect(focusIndex);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    focusIndex,
    handleCellSelect,
    handleContinueRound,
    handlePause,
    handleQuit,
    startRun,
  ]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      clearAiTimer();
      if (shakeTimerRef.current) window.clearInterval(shakeTimerRef.current);
      if (particleTimerRef.current) window.clearTimeout(particleTimerRef.current);
    };
  }, [clearAiTimer]);

  const isHighScore =
    phase === "gameOver" && qualifiesForHighScore(score.score, difficulty);

  const bannerAccent =
    phase === "playing"
      ? currentPlayer === PLAYER
        ? "cyan"
        : "magenta"
      : roundResult === "win"
        ? "lime"
        : roundResult === "loss"
          ? "magenta"
          : "amber";

  return (
    <div
      ref={rootRef}
      className="relative h-full min-h-svh w-full overflow-hidden bg-void text-white"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-10%] h-[55vh] w-[55vh] rounded-full bg-neon-cyan/15 blur-[100px]" />
        <div className="absolute -right-20 bottom-[-5%] h-[50vh] w-[50vh] rounded-full bg-neon-magenta/15 blur-[110px]" />
        <div className="absolute left-1/2 top-1/3 h-[30vh] w-[30vh] -translate-x-1/2 rounded-full bg-neon-lime/5 blur-[80px]" />
        <div className="scanlines absolute inset-0 opacity-70" />
        <div className="crt-vignette absolute inset-0" />
      </div>

      <Particles particles={particles} />

      {flash && (
        <div
          className="screen-flash pointer-events-none absolute inset-0 z-30"
          style={{ background: flash }}
        />
      )}

      <div
        className="relative z-10 flex h-full min-h-svh flex-col gpu"
        style={{
          transform: `translate3d(${shake.x}px, ${shake.y}px, 0)`,
        }}
      >
        {phase === "start" ? (
          <StartScreen
            highScores={highScores}
            difficulty={difficulty}
            onDifficulty={setDifficulty}
            gameMode={gameMode}
            onGameMode={setGameMode}
            onStart={startRun}
          />
        ) : (
          <div className="flex flex-1 flex-col px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
            <Hud
              score={score}
              difficulty={difficulty}
              gameMode={gameMode}
              lives={lives}
              onPause={handlePause}
              canPause={phase === "playing"}
            />

            <TurnBanner
              message={
                phase === "paused"
                  ? "Paused"
                  : phase === "gameOver"
                    ? "Game over"
                    : phase === "roundOver"
                      ? statusMsg
                      : currentPlayer === PLAYER
                        ? gameMode === "human"
                          ? "Player 1 · X"
                          : "Your move · X"
                        : gameMode === "human"
                          ? "Player 2 · O"
                          : "AI move · O"
              }
              accent={bannerAccent}
            />

            <div
              ref={boardWrapRef}
              className="mx-auto w-full max-w-[min(92vw,420px)] flex-1 flex items-center"
            >
              <Board
                board={board}
                focusIndex={focusIndex}
                winningLine={winningLine}
                disabled={
                  phase !== "playing" ||
                  currentPlayer !== PLAYER ||
                  Boolean(winningLine) ||
                  Boolean(roundResult)
                }
                lastMove={lastMove}
                onCellSelect={handleCellSelect}
                currentPlayer={currentPlayer}
              />
            </div>

            <footer className="mx-auto mt-4 w-full max-w-lg text-center text-[11px] text-white/30">
              <p className="hidden sm:block">
                Keys 1–9 place · Arrows move · Enter confirm · Esc pause · R restart
              </p>
              <p className="sm:hidden">Tap a cell · Pause top-right · Instant restart on game over</p>
            </footer>
          </div>
        )}
      </div>

      {phase === "paused" && (
        <PauseOverlay
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}

      {phase === "roundOver" && roundResult && (
        <RoundOverOverlay
          result={roundResult}
          pointsGained={pointsGained}
          score={score}
          gameMode={gameMode}
          onContinue={handleContinueRound}
        />
      )}

      {phase === "gameOver" && (
        <GameOverOverlay
          score={score}
          difficulty={difficulty}
          isHighScore={isHighScore}
          onSave={handleSaveScore}
          onRestart={handleRestart}
          onMenu={handleQuit}
        />
      )}
    </div>
  );
}

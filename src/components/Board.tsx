import { Board as BoardType, CellValue, Player } from "../game/types";

interface BoardProps {
  board: BoardType;
  focusIndex: number;
  winningLine: number[] | null;
  disabled: boolean;
  lastMove: number | null;
  onCellSelect: (index: number) => void;
  currentPlayer: Player;
}

function Mark({ value, popping }: { value: CellValue; popping: boolean }) {
  if (!value) return null;
  const isX = value === "X";
  return (
    <span
      className={`block text-[clamp(2.4rem,10vw,3.6rem)] font-black leading-none ${
        popping ? "animate-mark-pop" : ""
      } ${isX ? "text-neon-cyan" : "text-neon-magenta"}`}
      style={{
        textShadow: isX
          ? "0 0 12px rgba(34,240,255,0.9), 0 0 28px rgba(34,240,255,0.45)"
          : "0 0 12px rgba(255,43,214,0.9), 0 0 28px rgba(255,43,214,0.45)",
      }}
      aria-hidden
    >
      {value}
    </span>
  );
}

function WinLine({ line }: { line: number[] }) {
  // Map cell indices to SVG coordinates in a 3x3 grid (viewBox 0 0 300 300)
  const centers = [
    [50, 50],
    [150, 50],
    [250, 50],
    [50, 150],
    [150, 150],
    [250, 150],
    [50, 250],
    [150, 250],
    [250, 250],
  ] as const;
  const [a, , c] = line;
  const [x1, y1] = centers[a];
  const [x2, y2] = centers[c];

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      viewBox="0 0 300 300"
      aria-hidden
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#b8ff3c"
        strokeWidth="10"
        strokeLinecap="round"
        className="win-line"
        style={{
          filter: "drop-shadow(0 0 8px #b8ff3c) drop-shadow(0 0 18px #b8ff3c)",
        }}
      />
    </svg>
  );
}

export function Board({
  board,
  focusIndex,
  winningLine,
  disabled,
  lastMove,
  onCellSelect,
  currentPlayer,
}: BoardProps) {
  return (
    <div
      className="board-shell relative mx-auto aspect-square w-full max-w-[min(92vw,420px)] rounded-3xl border border-white/10 bg-panel/80 p-3 backdrop-blur-md gpu"
      role="grid"
      aria-label="Tic tac toe board"
    >
      <div className="absolute inset-3 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent" />
      <div className="relative grid h-full w-full grid-cols-3 grid-rows-3 gap-2 sm:gap-3">
        {board.map((cell, index) => {
          const isWin = winningLine?.includes(index) ?? false;
          const isFocus = focusIndex === index && !disabled && !cell;
          const isLast = lastMove === index;
          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-label={
                cell
                  ? `Cell ${index + 1}, ${cell}`
                  : `Cell ${index + 1}, empty`
              }
              disabled={disabled || cell !== null}
              onClick={() => onCellSelect(index)}
              className={`relative flex items-center justify-center rounded-2xl border transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-lime/70 ${
                isWin
                  ? "border-neon-lime/60 bg-neon-lime/15 scale-[1.02]"
                  : isFocus
                    ? "cell-focus border-neon-cyan/70 bg-neon-cyan/10 shadow-[0_0_24px_rgba(34,240,255,0.25)]"
                    : "border-white/10 bg-black/35 hover:border-white/25 hover:bg-white/[0.06] active:scale-95"
              } ${isLast && !isWin ? "ring-1 ring-white/20" : ""} disabled:cursor-default`}
            >
              {/* subtle cell number for keyboard orientation */}
              {!cell && (
                <span className="absolute left-2 top-1.5 text-[10px] font-semibold tracking-wider text-white/20">
                  {index + 1}
                </span>
              )}
              <Mark value={cell} popping={isLast || isWin} />
              {isFocus && (
                <span
                  className={`absolute inset-2 rounded-xl border border-dashed ${
                    currentPlayer === "X"
                      ? "border-neon-cyan/40"
                      : "border-neon-magenta/40"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
      {winningLine && <WinLine line={winningLine} />}
    </div>
  );
}

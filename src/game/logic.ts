import {
  Board,
  CellValue,
  Difficulty,
  Player,
  WIN_LINES,
} from "./types";

export function checkWinner(board: Board): {
  winner: Player | null;
  line: number[] | null;
} {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line };
    }
  }
  return { winner: null, line: null };
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

export function getAvailableMoves(board: Board): number[] {
  const moves: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  ai: Player,
  human: Player,
  alpha: number,
  beta: number
): number {
  const { winner } = checkWinner(board);
  if (winner === ai) return 10 - depth;
  if (winner === human) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of getAvailableMoves(board)) {
      board[move] = ai;
      best = Math.max(best, minimax(board, depth + 1, false, ai, human, alpha, beta));
      board[move] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of getAvailableMoves(board)) {
    board[move] = human;
    best = Math.min(best, minimax(board, depth + 1, true, ai, human, alpha, beta));
    board[move] = null;
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function getBestMove(board: Board, ai: Player, human: Player): number {
  let bestScore = -Infinity;
  let bestMove = getAvailableMoves(board)[0] ?? 0;
  const clone = [...board] as Board;

  for (const move of getAvailableMoves(clone)) {
    clone[move] = ai;
    const score = minimax(clone, 0, false, ai, human, -Infinity, Infinity);
    clone[move] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function findWinningMove(board: Board, player: Player): number | null {
  for (const move of getAvailableMoves(board)) {
    const next = [...board] as Board;
    next[move] = player;
    if (checkWinner(next).winner === player) return move;
  }
  return null;
}

export function getAiMove(
  board: Board,
  difficulty: Difficulty,
  ai: Player = "O",
  human: Player = "X"
): number {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) return 0;

  if (difficulty === "easy") {
    // Mostly random, occasionally block
    if (Math.random() < 0.25) {
      const block = findWinningMove(board, human);
      if (block !== null) return block;
    }
    return pickRandom(moves);
  }

  if (difficulty === "normal") {
    const win = findWinningMove(board, ai);
    if (win !== null) return win;
    const block = findWinningMove(board, human);
    if (block !== null) return block;
    // Prefer center/corners
    const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7].filter((i) =>
      moves.includes(i)
    );
    if (Math.random() < 0.65) return preferred[0];
    return pickRandom(moves);
  }

  // Hard: perfect play with tiny chance of "human" mistake early
  if (moves.length >= 8 && Math.random() < 0.08) {
    return pickRandom(moves);
  }
  return getBestMove(board, ai, human);
}

export function placeMark(board: Board, index: number, player: Player): Board {
  if (board[index] !== null) return board;
  const next = [...board] as Board;
  next[index] = player;
  return next;
}

export function cellLabel(value: CellValue): string {
  if (value === "X") return "X";
  if (value === "O") return "O";
  return "";
}

export function scoreForWin(streak: number, difficulty: Difficulty): number {
  const base = difficulty === "easy" ? 80 : difficulty === "normal" ? 120 : 180;
  const streakBonus = Math.min(streak, 8) * 25;
  return base + streakBonus;
}

export function scoreForDraw(difficulty: Difficulty): number {
  return difficulty === "hard" ? 40 : difficulty === "normal" ? 25 : 10;
}

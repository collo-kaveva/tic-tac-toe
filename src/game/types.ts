export type Player = "X" | "O";
export type CellValue = Player | null;
export type Board = CellValue[];

export type GamePhase =
  | "start"
  | "playing"
  | "paused"
  | "roundOver"
  | "gameOver";

export type Difficulty = "easy" | "normal" | "hard";

export type GameMode = "ai" | "human";

export interface HighScoreEntry {
  id: string;
  name: string;
  score: number;
  streak: number;
  wins: number;
  date: string;
  difficulty: Difficulty;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  size: number;
  color: string;
  life: number;
}

export interface ScoreState {
  score: number;
  streak: number;
  bestStreak: number;
  wins: number;
  losses: number;
  draws: number;
  round: number;
}

export const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const EMPTY_BOARD: Board = Array(9).fill(null);

export const INITIAL_SCORE: ScoreState = {
  score: 0,
  streak: 0,
  bestStreak: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  round: 1,
};

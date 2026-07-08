import { Difficulty, HighScoreEntry } from "./types";

const STORAGE_KEY = "neon-tac-highscores-v1";
const MAX_ENTRIES = 8;

export function loadHighScores(): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HighScoreEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e) =>
          e &&
          typeof e.score === "number" &&
          typeof e.name === "string" &&
          typeof e.date === "string"
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveHighScore(entry: Omit<HighScoreEntry, "id" | "date">): HighScoreEntry[] {
  const current = loadHighScores();
  const next: HighScoreEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
  };
  const merged = [...current, next]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore quota errors
  }
  return merged;
}

export function qualifiesForHighScore(score: number, _difficulty?: Difficulty): boolean {
  if (score <= 0) return false;
  const scores = loadHighScores();
  if (scores.length < MAX_ENTRIES) return true;
  return score > scores[scores.length - 1].score;
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function difficultyLabel(d: Difficulty): string {
  return d === "easy" ? "Easy" : d === "normal" ? "Normal" : "Hard";
}

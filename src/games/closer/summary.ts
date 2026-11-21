import { fetchManifest } from "./game/loader";
import { dateForPuzzle, resolveSchedule } from "./game/schedule";
import { findSolve, puzzleState, summarise, type PuzzleState, type StatsRecord } from "./game/stats";
import { loadStats } from "./game/storage";

/** What the hub shows about one day's Closer, read from this device. */
export type CloserDay = {
  puzzle: number;
  date: Date;
  state: PuzzleState;
  guesses: number | null;
  seconds: number | null;
};

export type CloserSummary = {
  today: CloserDay;
  /** The days before today, most recent first. */
  past: CloserDay[];
  streak: number;
};

function dayOf(stats: StatsRecord, epoch: string, puzzle: number, today: number): CloserDay {
  const solve = findSolve(stats, puzzle);
  return {
    puzzle,
    date: dateForPuzzle(epoch, puzzle),
    state: puzzleState(stats, puzzle, today),
    guesses: solve?.guesses ?? null,
    seconds: solve?.seconds ?? null,
  };
}

/**
 * Only the manifest is fetched (a few hundred bytes) - which puzzle is today's
 * depends on the epoch and how many puzzles have been built.
 */
export async function closerSummary(pastCount: number, now = new Date()): Promise<CloserSummary> {
  const [manifest, stats] = await Promise.all([fetchManifest(), loadStats()]);
  const { today } = resolveSchedule(manifest.epoch, manifest.puzzleCount, now, null);
  const past: CloserDay[] = [];
  for (let puzzle = today - 1; puzzle >= 0 && past.length < pastCount; puzzle--) {
    past.push(dayOf(stats, manifest.epoch, puzzle, today));
  }
  return {
    today: dayOf(stats, manifest.epoch, today, today),
    past,
    streak: summarise(stats, today).currentStreak,
  };
}

import { fetchManifest } from "./game/loader";
import { resolveSchedule } from "./game/schedule";
import { findSolve, puzzleState, summarise, type PuzzleState } from "./game/stats";
import { loadStats } from "./game/storage";

/** What the hub shows about today's Closer, read from this device. */
export type CloserToday = {
  puzzle: number;
  state: PuzzleState;
  guesses: number | null;
  seconds: number | null;
  streak: number;
};

/**
 * Only the manifest is fetched (a few hundred bytes) - which puzzle is today's
 * depends on the epoch and how many puzzles have been built.
 */
export async function closerToday(now = new Date()): Promise<CloserToday> {
  const [manifest, stats] = await Promise.all([fetchManifest(), loadStats()]);
  const { today } = resolveSchedule(manifest.epoch, manifest.puzzleCount, now, null);
  const solve = findSolve(stats, today);
  return {
    puzzle: today,
    state: puzzleState(stats, today, today),
    guesses: solve?.guesses ?? null,
    seconds: solve?.seconds ?? null,
    streak: summarise(stats, today).currentStreak,
  };
}

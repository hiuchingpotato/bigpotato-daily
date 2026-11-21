/**
 * Made-up players for Closer's leaderboard tab.
 *
 * Closer keeps every result on the device, so there is no shared board yet. Until
 * there is, the hub ranks your own solve against this field. It is seeded by the
 * puzzle number, so everyone sees the same names for a puzzle and they change when
 * the puzzle does.
 */

export type CloserEntry = {
  id: string;
  name: string;
  guesses: number;
  seconds: number;
};

const NAMES = [
  "Word Nerd", "Synonym Sam", "Thesaurus Rex", "Close Call Cal", "Lexi Con", "Hot Or Not",
  "Meaning Mo", "Warmer Wendy", "Semantic Sue", "Brainwave Bo", "Vocab Viv", "Galaxy Gus",
  "Orbit Ollie", "Splaturn Sid", "Star Gazer", "Comet Kate", "Rocket Rory", "Nebula Ned",
  "Moon Pie", "Lucky Guess", "Clue Lou", "Dictionary Di", "Hint Hunter", "Spot On Si",
] as const;

/** mulberry32: small, fast and the same on every device. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoPlayers(puzzle: number): CloserEntry[] {
  const rand = rng(0xc105e4 ^ (puzzle * 2654435761));
  const names = [...NAMES];
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [names[i], names[j]] = [names[j]!, names[i]!];
  }
  const count = 8 + Math.floor(rand() * 7);
  return names.slice(0, count).map((name) => {
    // Most solves take a few dozen guesses; the odd lucky one is very quick, and some drag on.
    const guesses = Math.max(3, Math.round(Math.exp(2.6 + rand() * 1.9)));
    const seconds = Math.round(guesses * (8 + rand() * 14));
    return { id: `demo:${name}`, name, guesses, seconds };
  });
}

/** Fewest guesses first, then fastest. */
export function rankEntries(entries: CloserEntry[]): CloserEntry[] {
  return [...entries].sort((a, b) => a.guesses - b.guesses || a.seconds - b.seconds);
}

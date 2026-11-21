import { describe, expect, it } from "vitest";

import { demoPlayers, rankEntries } from "./demoPlayers";

describe("Closer demo players", () => {
  it("gives everyone the same field for a puzzle, and a new one for the next", () => {
    expect(demoPlayers(95)).toEqual(demoPlayers(95));
    expect(demoPlayers(96)).not.toEqual(demoPlayers(95));
  });

  it("produces plausible, uniquely named solves", () => {
    for (let puzzle = 0; puzzle < 60; puzzle++) {
      const players = demoPlayers(puzzle);
      expect(players.length).toBeGreaterThanOrEqual(8);
      expect(new Set(players.map((p) => p.id)).size).toBe(players.length);
      for (const p of players) {
        expect(p.guesses).toBeGreaterThanOrEqual(3);
        expect(p.guesses).toBeLessThan(200);
        expect(p.seconds).toBeGreaterThan(0);
      }
    }
  });

  it("ranks fewest guesses first, then fastest", () => {
    const ranked = rankEntries([
      { id: "a", name: "A", guesses: 20, seconds: 300 },
      { id: "b", name: "B", guesses: 12, seconds: 500 },
      { id: "c", name: "C", guesses: 20, seconds: 100 },
    ]);
    expect(ranked.map((e) => e.id)).toEqual(["b", "c", "a"]);
  });
});

# 🍕 P for Pizza Daily

A daily puzzle version of Big Potato's **P for Pizza**. Everyone gets the same cards each day, races the clock to build the biggest pizza slice they can, and compares scores on a daily leaderboard.

It's a mobile-first web app (React + TypeScript + Vite), built so it can be wrapped as a native iOS/Android app later.

## How the board game works

- Triangular cards have a **category** on one side and a **letter** on the other.
- Three letter cards sit against the edges of the category pile. Players shout an answer that fits the category and starts with the letter, e.g. *TV Shows + B → Baywatch*. The fastest player wins that card.
- Categories come in three colours: **green** (easy), **yellow** (medium) and **red** (hard).
- Won cards build a **giant pizza slice** out of nine triangles:
  - bottom row (5): any colour
  - middle row (3): yellow or red only
  - top (1): red only
- The first player to finish their slice wins.

## How the daily version works

| Board game | Daily puzzle |
| --- | --- |
| Shuffled deck | A deck seeded by the date, so every player gets the same cards in the same order |
| Shout it out | Type it. The answer counts for whichever of the three cards it fits, and if it fits more than one it goes to the hardest |
| Beat your friends to it | Beat the clock: **2:30** to fill all nine triangles |
| Group agrees the card is impossible | **Skip** a card and lose 5 seconds |
| First to finish wins | Highest score wins the day's leaderboard |

**Scoring.** Green triangles are worth 10, yellow 20 and red 30. Filling the whole slice adds a 50-point bonus plus 1 point for every second left on the clock. The maximum is 470.

Won triangles are placed automatically, filling the most restrictive row first (reds go to the top, then the middle, then the bottom). If a card's colour has no free slot left, the card is greyed out.

You get one game per day, and the clock keeps running if you reload. A new puzzle starts at local midnight.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # game logic tests (vitest)
npm run build
```

With no Supabase config, the leaderboard only saves scores in the current browser and is labelled "This device only". That's enough for local development.

### Global leaderboard (Supabase)

1. Create a Supabase project.
2. Run `supabase/migrations/001_scores.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Project layout

```
src/
  game/
    categories.ts    category card data: colour and accepted answers (aliases joined with |)
    daily.ts         seeded daily deck and puzzle numbering
    validate.ts      answer matching: accents, plurals, "the", small typos
    slice.ts         slot rules, placement and scoring
    useDailyGame.ts  game state, timer and persistence (React hook)
    share.ts         emoji result for sharing
  lib/
    leaderboard.ts   Supabase backend, with a local fallback
    storage.ts       player id/name and stats in localStorage
  components/        PizzaSlice (SVG), PromptCard, Leaderboard, Countdown
supabase/migrations/ database schema and row-level security
```

## Adding categories

Add an entry to `src/game/categories.ts`. The deck only uses a letter for a category when there are enough answers for it (8 for green, 4 for yellow, 3 for red), so thin letters are skipped automatically. The biggest risk in a letter game is rejecting a legitimate answer, so make answer lists as generous as you can.

## Roadmap

- **Mobile app.** Wrap the app with [Capacitor](https://capacitorjs.com/) (`npm i @capacitor/core @capacitor/cli && npx cap init && npx cap add ios android`). The layout already handles safe-area insets and has a web manifest.
- **Trustworthy scores.** Answers are currently checked in the browser and the answer lists ship with the app, so a determined player could fake a score. Next steps: Supabase anonymous auth, then submit the answers (not the score) to an Edge Function that re-checks them and calculates the score on the server.
- **Better answer checking.** Use an LLM or a larger dictionary as a fallback for answers missing from the curated lists, and add a "that should count!" report button.
- Official card content from the physical game, archive and practice modes, friend leagues, and push notifications for the daily puzzle.

---

P for Pizza is © Big Potato Games.

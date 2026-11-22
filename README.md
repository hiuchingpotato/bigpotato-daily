# Big Potato Daily

Big Potato's daily puzzles in one mobile-first web app (React + TypeScript + Vite):

- **P for Pizza** at `/pizza/` — match letters to categories and build the biggest slice. See [docs/pizza.md](docs/pizza.md).
- **Closer** at `/closer/` — guess the secret word; every guess shows how close you are in meaning. See [docs/closer.md](docs/closer.md).
- **Herd Mentality** at `/herd-mentality/` — six questions a day, 45 seconds each; say what most people would say. The reverse of [Krillion](https://krillion.io/), which rewards the rarest answer. Common answers gather cows into your herd, niche ones bring a pink cow (below).
- **Herd vs The world** at `/herd/` — one prompt a day ("Name a famous river."); give the answer you think most people will, once, and see at 11pm whether you're in the herd or the pink cow. Until there are enough real players, the crowd is an AI herd (below).

The home page at `/` has one row per game: today's card (puzzle number, your result and streak, and a countdown once you've played) followed by the previous 7 days to swipe through, and a "+ Streak & calendar" card. The header's **Leaderboard** and **Streak** buttons open `/leaderboard/` and `/stats/`; both are tabbed per game (tap or swipe; `?game=closer` opens on Closer). Streak shows each game's streak, quick stats and a month calendar of every day since launch (played, caught up later, missed…), where any day can be opened. `/leaderboard/` holds every game's board for today, one tab per game (tap or swipe; `?game=closer` opens Closer's). The games themselves no longer show a leaderboard. Closer's tab ranks your solve against demo players by fewest guesses, since Closer results don't leave the device yet. Both games roll over at the player's local midnight; past days open as `/pizza/?day=YYYY-MM-DD` and `/closer/?puzzle=N`, and never count towards the leaderboard or a streak.

The two games were merged from their own repos (`p-for-pizza-daily` and `semantle_bp`) with `git subtree`, so `git log` still has their history.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # both games' tests (vitest)
npm run build
```

P for Pizza works straight away. With no Supabase config its leaderboard is "This device only"; see [docs/pizza.md](docs/pizza.md) to set up the global one.

Closer needs its game data built first (`public/closer/data`, about 130MB, not committed). Follow the one-off setup in [docs/closer.md](docs/closer.md), then:

```bash
.tooling/venv/bin/python tools/closer/build_data.py
```

Without the data, the home page shows "Couldn’t load today’s puzzle" for Closer and the game shows an error.

## How it fits together

- **Routing.** `src/router.ts` maps `/`, `/pizza/`, `/closer/`, `/leaderboard/` and `/stats/` (under `BASE_URL`) to a screen, with no router library. A game remounts when its query changes, since it reads its puzzle from the URL on mount. Game routes keep a trailing slash because Closer's archive links are relative (`./`, `?puzzle=3`). Each game is lazy-loaded, so the home page doesn't download either game.
- **Styles.** Each stylesheet is scoped to its own screen. Page-level rules (CSS variables, `body`) match through `:root:has(.game-pizza)` / `:root:has(.game-closer)` / `:root:has(.hub)`, and everything else is nested under the wrapper class. The games use the same variable names for different things (`--ink` is Closer's background and P for Pizza's text), so don't move them back to a bare `:root`.
- **Home page data.** Each game has a `summary.ts` that reads its own saved data: P for Pizza from localStorage (`pfp:*`), Closer from IndexedDB (`closer/v2/*`). Each game shows its streak by its own rules. Closer's data still never leaves the device.

## Herd Mentality

- **Questions** come from the same answer lists as Herd vs The world (`src/games/herd/prompts.ts`), in their own fixed shuffle: six a day from launch (14 November 2026, the same day as Herd vs The world, so there are older games to go back to), never including that day's Herd vs The world question.
- **Scoring** (`src/games/mentality/mentality.ts`). Krillion doesn't publish how it ranks answers (its FAQ mentions word-frequency data, LLM help and a manual pass), so this game uses its own: each answer's share of the crowd comes from the prompt's weights, with 4% kept back for "something else". A round scores your answer's share as points out of 100. Herd = the top answer or within 5 points of it (a cow joins you); pink cow = under 3%, or not on the list (0 points); anything else is "more or less"; nothing typed when time runs out scores 0. Answers match forgivingly, like Herd vs The world.
- **Where you stand** is ranked against a simulated crowd of 1,000 players for the day (seeded, so every device sees the same curve), each answering in proportion to the shares.
- **Saved** in localStorage `herd-mentality:days`, one answer per round as you go, so a reload carries on at the next question. All-time cows and pink cows on the results and streak pages add up every game.
- **The field** (`Field.tsx`, `mentality.css`): grass and daisies drawn in CSS, eight of the FigJam cows sleeping, breathing and ambling. When a question is up they wake and stare, leaning in, and fidget in the last ten seconds. A herd answer walks a cow to the middle with a "!"; a pink cow charges in from the left and spins the cow in its way; "more or less" gets no reaction.

## Herd vs The world

- **Prompts** live in `src/games/herd/prompts.ts`, one per line with the answers a crowd gives and roughly how often (`Name a famous river.|Thames/river thames:32|Nile:26|...`). There are 240; a fixed shuffle runs through them all before repeating, a new one each midnight from launch (14 November 2026).
- **The AI herd** is 28–52 cow-named players a day, each picking an answer in proportion to those weights, seeded by the day so every device sees the same herd. They "answer" through the day, so the counter climbs, and are all in by the 11pm reveal.
- **Your answer** is locked once per day (localStorage `herd:answers`) and matched to the prompt's answers forgivingly (case, "the", plurals, aliases, small typos). In the herd = you share the most common answer; pink cow = nobody else said it. Answers made after 11pm, or on past days, still reveal but don't build a streak.
- `tools/herd/cow_print.py` regenerates the card's cow-print background; `tools/herd/cutout.py` trims the FigJam exports and cuts the cow heads off their white card. The cows, cow heads and grass hill come from the FigJam assets in `assets/hub/bp-herd-*.png`. On the game screen the pink cow snorts every 5 seconds and each herd cow hops or shuffles at its own random pace (off for reduced motion).

## Project layout

```
src/
  main.tsx, App.tsx    entry point and route switch
  router.ts, Link.tsx  the tiny router
  shell.css            page basics shared by every screen
  hub/                 the home page, the leaderboard and streak & calendar pages, and the arched title
  games/pizza/         P for Pizza (app, game logic, Supabase leaderboard, summary.ts)
  games/closer/        Closer (app, game logic, canvas board, summary.ts)
  games/mentality/     Herd Mentality (app, field and cows, scoring, summary.ts)
  games/herd/          Herd vs The world (app, prompts, AI herd and results, summary.ts)
public/closer/         Closer's marker art, and its built data (gitignored)
public/hub/            web-sized card artwork for the home page
public/herd/           the cows and the cow-print card background
public/herd-mentality/ Herd Mentality's grass card background
supabase/migrations/   P for Pizza leaderboard schema
tools/closer/          Closer's data pipeline (Python) and git hooks
scripts/closer/        Closer's preview renderers
assets/closer/         Closer's source artwork
assets/hub/            Big Potato source artwork for the home page (from the Daily Games FigJam)
docs/                  each game's original README
```

## Deploying

`.github/workflows/deploy.yml` is Closer's GitHub Pages workflow, repointed at this repo: it builds Closer's data, runs every test, builds with `PAGES_BASE=/bigpotato-daily/`, and copies `index.html` to `404.html` so deep links like `/pizza/` work on Pages. It hasn't been run yet.

If the app is served from `hiuchingpotato.github.io`, existing Closer players keep their progress, because saved data belongs to the origin and `semantle_bp` is already there.

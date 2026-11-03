# Big Potato Daily

Big Potato's daily puzzles in one mobile-first web app (React + TypeScript + Vite):

- **P for Pizza** at `/pizza/` — match letters to categories and build the biggest slice. See [docs/pizza.md](docs/pizza.md).
- **Closer** at `/closer/` — guess the secret word; every guess shows how close you are in meaning. See [docs/closer.md](docs/closer.md).

The home page at `/` shows each game's puzzle for today, whether you've played it, your streak, today's P for Pizza top 5, and a countdown to the next puzzles. Both games roll over at the player's local midnight.

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

- **Routing.** `src/router.ts` maps `/`, `/pizza/` and `/closer/` (under `BASE_URL`) to the hub or a game, with no router library. Game routes keep a trailing slash because Closer's archive links are relative (`./`, `?puzzle=3`). Each game is lazy-loaded, so the home page doesn't download either game.
- **Styles.** Each stylesheet is scoped to its own screen. Page-level rules (CSS variables, `body`) match through `:root:has(.game-pizza)` / `:root:has(.game-closer)` / `:root:has(.hub)`, and everything else is nested under the wrapper class. The games use the same variable names for different things (`--ink` is Closer's background and P for Pizza's text), so don't move them back to a bare `:root`.
- **Home page data.** Each game has a `summary.ts` that reads its own saved data: P for Pizza from localStorage (`pfp:*`), Closer from IndexedDB (`closer/v2/*`). Each game shows its streak by its own rules. Closer's data still never leaves the device.

## Project layout

```
src/
  main.tsx, App.tsx    entry point and route switch
  router.ts, Link.tsx  the tiny router
  shell.css            page basics shared by every screen
  hub/                 the home page
  games/pizza/         P for Pizza (app, game logic, Supabase leaderboard, summary.ts)
  games/closer/        Closer (app, game logic, canvas board, summary.ts)
public/closer/         Closer's marker art, and its built data (gitignored)
supabase/migrations/   P for Pizza leaderboard schema
tools/closer/          Closer's data pipeline (Python) and git hooks
scripts/closer/        Closer's preview renderers
assets/closer/         Closer's source artwork
docs/                  each game's original README
```

## Deploying

`.github/workflows/deploy.yml` is Closer's GitHub Pages workflow, repointed at this repo: it builds Closer's data, runs every test, builds with `PAGES_BASE=/bigpotato-daily/`, and copies `index.html` to `404.html` so deep links like `/pizza/` work on Pages. It hasn't been run yet.

If the app is served from `hiuchingpotato.github.io`, existing Closer players keep their progress, because saved data belongs to the origin and `semantle_bp` is already there.

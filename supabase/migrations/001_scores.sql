-- Daily leaderboard. One row per player per day; rows can't be edited or deleted by clients.
create table if not exists public.scores (
  id           bigint generated always as identity primary key,
  day          date        not null,
  player_id    uuid        not null,
  name         text        not null check (char_length(name) between 1 and 16),
  score        integer     not null check (score between 0 and 470),
  slice        text        not null check (slice ~ '^[gyr-]{9}$'),
  seconds_left integer     not null default 0 check (seconds_left between 0 and 150),
  created_at   timestamptz not null default now(),
  unique (day, player_id)
);

create index if not exists scores_day_score_idx on public.scores (day, score desc, created_at);

alter table public.scores enable row level security;

create policy "Anyone can read scores"
  on public.scores for select
  to anon, authenticated
  using (true);

-- Only allow submitting for roughly "today" (covers every timezone).
create policy "Anyone can submit a score for today"
  on public.scores for insert
  to anon, authenticated
  with check (day between (now() at time zone 'utc')::date - 1 and (now() at time zone 'utc')::date + 1);

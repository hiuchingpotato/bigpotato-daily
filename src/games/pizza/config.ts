// Prototype switches. Flip these back for the real daily game.

/** Countdown clock, time bonus and skip penalty. Off while we playtest the core loop. */
export const TIMER_ENABLED = false

/** Allow replaying with a fresh deal after finishing, instead of one game per day. */
export const UNLIMITED_PLAYS = true

/**
 * With no Supabase config, fill the leaderboard with made-up players (labelled "Demo")
 * alongside this device's own score. Ignored once Supabase is set up.
 */
export const DEMO_LEADERBOARD = true

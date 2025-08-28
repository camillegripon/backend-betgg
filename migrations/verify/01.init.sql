-- Verify betSite-db:01.init on pg

BEGIN;

SELECT 1 FROM bets LIMIT 1;
SELECT 1 FROM players_stats LIMIT 1;
SELECT 1 FROM match_dragons LIMIT 1;
SELECT 1 FROM games LIMIT 1;
SELECT 1 FROM matches LIMIT 1;
SELECT 1 FROM player_team_history LIMIT 1;
SELECT 1 FROM players LIMIT 1;
SELECT 1 FROM champions LIMIT 1;
SELECT 1 FROM teams LIMIT 1;
SELECT 1 FROM leagues LIMIT 1;
SELECT 1 FROM friends LIMIT 1;
SELECT 1 FROM users LIMIT 1;

ROLLBACK;

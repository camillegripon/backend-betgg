BEGIN;

TRUNCATE TABLE champions, leagues, teams, players, player_team_history, matches, games, players_stats, users, championship RESTART IDENTITY CASCADE;

COMMIT;

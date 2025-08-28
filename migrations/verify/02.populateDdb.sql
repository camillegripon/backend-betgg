-- Verify betSite-db:02.populateDdb on pg

BEGIN;

SELECT COUNT(*) FROM champions;
SELECT COUNT(*) FROM leagues;
SELECT COUNT(*) FROM teams;

ROLLBACK;

import pool from "../config/db.js";

// ✅ Récupérer tous les matchs (avec filtres)
export const getMatches = async (req, res) => {
    try {
        const { league } = req.query;

        let query = `
SELECT 
    games.id_game,
    games.bo,
    games.winner_team,
    matches.date_match AS match_date,
    team1.name_team AS team1_name,
    team2.name_team AS team2_name,
    odds_team1.odds AS team1_odds,
    odds_team2.odds AS team2_odds
FROM games
JOIN game_matches ON games.id_game = game_matches.id_game
JOIN matches ON game_matches.id_match = matches.id_match AND matches.game_number = 1
JOIN teams AS team1 ON matches.team1 = team1.id_team
JOIN teams AS team2 ON matches.team2 = team2.id_team
LEFT JOIN odds AS odds_team1 ON odds_team1.id_game = games.id_game AND odds_team1.id_team = team1.id_team
LEFT JOIN odds AS odds_team2 ON odds_team2.id_game = games.id_game AND odds_team2.id_team = team2.id_team
        `;

        let params = [];

        if (league) {
            query += " AND leagues.name_league = $1";
            params.push(league);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erreur serveur pour trouver les matchs" });
    }
};


export const addBO = async (req, res) => {
    try {
        console.log("Données reçues:", req.body);  // ✅ Log 1 : Vérifie les données entrantes

        const { team1: team1Name, team2: team2Name, league: leagueName, championship: championshipName, bo, date_match } = req.body;
        console.log("Noms extraits:", { team1Name, team2Name, leagueName, championshipName, bo, date_match });  // ✅ Log 2

        // Résolution des IDs
        const team1Result = await pool.query("SELECT id_team FROM teams WHERE name_team = $1", [team1Name]);
        const team2Result = await pool.query("SELECT id_team FROM teams WHERE name_team = $1", [team2Name]);
        const leagueResult = await pool.query("SELECT id_league FROM leagues WHERE name_league = $1", [leagueName]);
        const championshipResult = await pool.query("SELECT id_championship FROM championship WHERE name_championship = $1", [championshipName]);

        console.log("Résultats des requêtes:", {  // ✅ Log 3
            team1: team1Result.rows,
            team2: team2Result.rows,
            league: leagueResult.rows,
            championship: championshipResult.rows
        });

        if (team1Result.rows.length === 0 || team2Result.rows.length === 0 ||
            leagueResult.rows.length === 0 || championshipResult.rows.length === 0) {
            return res.status(400).json({
                error: "Équipe, league ou championnat introuvable",
                details: {
                    team1: team1Result.rows.length > 0,
                    team2: team2Result.rows.length > 0,
                    league: leagueResult.rows.length > 0,
                    championship: championshipResult.rows.length > 0
                }
            });
        }

        const id_team1 = team1Result.rows[0].id_team;
        const id_team2 = team2Result.rows[0].id_team;
        const id_league = leagueResult.rows[0].id_league;
        const id_championship = championshipResult.rows[0].id_championship;
        console.log("IDs résolus:", { id_team1, id_team2, id_league, id_championship });  // ✅ Log 4

        // Création du BO
        const gameResult = await pool.query("INSERT INTO games (bo) VALUES ($1) RETURNING id_game", [bo]);
        const id_game = gameResult.rows[0].id_game;
        console.log("BO créé avec id_game:", id_game);  // ✅ Log 5

        // Ajout des matchs
        for (let i = 0; i < bo; i++) {
            const matchResult = await pool.query(
                `INSERT INTO matches
                 (team1, team2, id_league, id_championship, game_number, date_match, victoire)
                 VALUES ($1, $2, $3, $4, $5, $6, NULL)
                 RETURNING id_match`,
                [id_team1, id_team2, id_league, id_championship, i + 1, date_match]
            );
            console.log(`Match ${i + 1} créé avec id_match:`, matchResult.rows[0].id_match);  // ✅ Log 6

            await pool.query(
                "INSERT INTO game_matches (id_game, id_match) VALUES ($1, $2)",
                [id_game, matchResult.rows[0].id_match]
            );
        }

        res.status(201).json({ success: true, id_game });
    } catch (err) {
        console.error("Erreur complète:", err);  // ✅ Log 7 : Affiche l'erreur exacte
        res.status(500).json({ error: "Erreur serveur", details: err.message });
    }
};





// ✅ Ajouter un match
export const addMatch = async (req, res) => {
    try {
        const { team1, team2, league, date } = req.body;
        if (!team1 || !team2 || !league || !date) {
            return res.status(400).json({ error: "Tous les champs sont requis" });
        }

        const result = await pool.query(
            "INSERT INTO matches (team1, team2, league, score) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [team1, team2, league, date]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

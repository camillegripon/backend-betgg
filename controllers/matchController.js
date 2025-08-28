import pool from "../config/db.js";

// ✅ Récupérer tous les matchs (avec filtres)
export const getMatches = async (req, res) => {
    try {
        const { league, saison } = req.query;

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
        if (saison) {
            query += params.length ? " AND matches.date_match LIKE $2" : " AND matches.date_match LIKE $1";
            params.push(`${saison}%`); 
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// ✅ Ajouter un match
export const addMatch = async (req, res) => {
    try {
        const { team1, team2, league, saison, score } = req.body;
        if (!team1 || !team2 || !league || !saison || !score) {
            return res.status(400).json({ error: "Tous les champs sont requis" });
        }

        const result = await pool.query(
            "INSERT INTO matches (team1, team2, league, saison, score) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [team1, team2, league, saison, score]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

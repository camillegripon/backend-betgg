import pool from "../config/db.js";

export const getMatches = async (req, res) => {
    try {
        const { league } = req.query;

        const query = `
            SELECT
                g.id_game,
                g.bo,
                g.winner_team AS winner_team_id,
                t_winner.name_team AS winner_team_name,
                m.date_match AS match_date,
                t1.name_team AS team1_name,
                t1.id_team AS team1_id,
                t2.name_team AS team2_name,
                t2.id_team AS team2_id,
                o1.odds AS team1_odds,
                o2.odds AS team2_odds,
                COUNT(CASE WHEN m.victoire = t1.id_team THEN 1 END) AS team1_victories,
                COUNT(CASE WHEN m.victoire = t2.id_team THEN 1 END) AS team2_victories
            FROM games g
            JOIN game_matches gm ON g.id_game = gm.id_game
            JOIN matches m ON gm.id_match = m.id_match
            JOIN teams t1 ON m.team1 = t1.id_team
            JOIN teams t2 ON m.team2 = t2.id_team
            LEFT JOIN teams t_winner ON g.winner_team = t_winner.id_team
            LEFT JOIN odds o1 ON o1.id_game = g.id_game AND o1.id_team = t1.id_team
            LEFT JOIN odds o2 ON o2.id_game = g.id_game AND o2.id_team = t2.id_team
            ${league ? "JOIN leagues l ON m.league = l.id_league" : ""}
            GROUP BY g.id_game, t1.id_team, t2.id_team, m.date_match, t_winner.name_team, o1.odds, o2.odds
            ORDER BY m.date_match DESC
        `;

        const params = league ? [league] : [];
        const result = await pool.query(query, params);

        // ✅ Formate les données pour le frontend
        const matches = result.rows.map(row => ({
            ...row,
            match_date: row.match_date.toISOString(),
            score: `${row.team1_victories || 0}-${row.team2_victories || 0}`
        }));

        res.json(matches);
    } catch (err) {
        console.error("Erreur getMatches:", err.message);
        res.status(500).json({ error: "Erreur serveur" });
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

import pool from "../config/db.js";

export const getAllTeamName = async (req, res) => {
    try {
        const teams = await pool.query("SELECT id_team, name_team FROM teams ORDER BY name_team");
        res.json(teams.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const pendingBos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                g.id_game,
                g.bo,
                t1.name_team AS team1_name,
                t2.name_team AS team2_name,
                t1.id_team AS team1_id,
                t2.id_team AS team2_id,
                m.date_match AS last_game_date
            FROM games g
            JOIN game_matches gm ON g.id_game = gm.id_game
            JOIN matches m ON gm.id_match = m.id_match AND m.game_number = 1
            JOIN teams t1 ON m.team1 = t1.id_team
            JOIN teams t2 ON m.team2 = t2.id_team
            WHERE g.winner_team IS NULL
            ORDER BY m.date_match DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Erreur:", err.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export default { getAllTeamName, pendingBos };
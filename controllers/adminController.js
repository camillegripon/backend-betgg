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

export default { getAllTeamName };
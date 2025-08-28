import pool from "../config/db.js";


//Récupérer tous les champions
export const getChampions = async (req, res) => {
    try {
        let query = "SELECT * FROM champions";
        const result = await pool.query(query);
        res.json(result.rows);
        console.log(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({error: "Erreur serveur"});
}};

export default getChampions;
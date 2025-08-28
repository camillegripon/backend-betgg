import pool from "../config/db.js";

export const newBet = async (req, res) => {
    console.log("Requête reçue avec!" , req.body);
    const { id_user, id_game, name_team, amount } = req.body;

    if (!id_user || !id_game || !name_team || !amount) {
        return res.status(400).json({ error: "Il manque un champs" });
    }

    try {
        const response = await pool.query(
            "SELECT id_team FROM teams WHERE name_team =$1",
            [name_team]
        );
        if(response.rows.length === 0){
            return res.status(404).json({ error: "Impossible de retrouver l'id_team"});
        }
        const id_team = response.rows[0].id_team;
        const { rows } = await pool.query(
            "SELECT odds FROM odds WHERE id_game = $1 AND id_team = $2",
            [id_game, id_team]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Côte non trouvée" });
        }

        const odds = rows[0].odds;
        const payout = amount * odds;
        const neekosResult = await pool.query(
            `SELECT neekos FROM users WHERE id_user = $1`, [id_user]
        );
        const neekos = neekosResult.rows[0].neekos;
        if(neekos >=amount){
        await pool.query(
            `INSERT INTO bets (id_user, id_game, id_team, amount, status, payout)
         VALUES ($1, $2, $3, $4, 'pending', $5)`,
            [id_user, id_game, id_team, amount, payout]
        );
        await pool.query(
            `UPDATE users SET neekos = neekos - $2 WHERE id_user = $1`, [id_user, amount]
        );
        res.status(201).json({ message: "Pari enregistré avec un gain potentiel de", payout });
        } else {
        res.status(401).json({message: "Désolé, vous n'avez pas assez de neekos"});
        }

    } catch (error) {
        console.error("Erreur lors de l'insertion du pari:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'insertion du pari dans la BDD" });
    }

};

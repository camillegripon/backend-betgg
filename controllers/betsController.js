import pool from "../config/db.js";

export const newBet = async (req, res) => {
    console.log("Requête reçue avec!", req.body);
    const { id_user, id_game, name_team, amount } = req.body;

    if (!id_user || !id_game || !name_team || !amount) {
        return res.status(400).json({ error: "Il manque un champ" });
    }

    try {
        // 1. Récupère l'ID de l'équipe
        const teamResponse = await pool.query(
            "SELECT id_team FROM teams WHERE name_team = $1",
            [name_team]
        );
        if (teamResponse.rows.length === 0) {
            return res.status(404).json({ error: "Impossible de retrouver l'id_team" });
        }
        const id_team = teamResponse.rows[0].id_team;

        // 2. Récupère les cotes
        const oddsResponse = await pool.query(
            "SELECT odds FROM odds WHERE id_game = $1 AND id_team = $2",
            [id_game, id_team]
        );
        if (oddsResponse.rows.length === 0) {
            return res.status(404).json({ error: "Côte non trouvée" });
        }
        const odds = oddsResponse.rows[0].odds;
        const payout = amount * odds;

        // 3. Vérifie le solde (neekos)
        const neekosResult = await pool.query(
            "SELECT neekos FROM users WHERE id_user = $1",
            [id_user]
        );
        const neekos = neekosResult.rows[0].neekos;

        if (neekos >= amount) {
            // 4. Crée le pari
            await pool.query(
                `INSERT INTO bets (id_user, id_game, id_team, amount, status, payout)
                 VALUES ($1, $2, $3, $4, 'pending', $5)`,
                [id_user, id_game, id_team, amount, payout]
            );

            // 5. Met à jour le solde
            await pool.query(
                "UPDATE users SET neekos = neekos - $2 WHERE id_user = $1",
                [id_user, amount]
            );

            // ✅ Correction : Virgule ajoutée après "message"
            res.status(201).json({
                message: "Pari enregistré avec succès",
                payout: payout.toFixed(2)  // Arrondi à 2 décimales
            });
        } else {
            res.status(403).json({ message: "Solde insuffisant" });  // 403 = Forbidden
        }
    } catch (error) {
        console.error("Erreur lors de l'insertion du pari:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const getCurrentBets = async (req, res) => {
    try {
        const userId = req.query.id_user;
        if (!userId) {
            return res.status(400).json({ error: "ID utilisateur manquant" });
        }

        // ✅ Requête adaptée à ta structure de base de données
        const query = `
            SELECT
                bets.id_bet,
                bets.amount,
                bets.status,
                bets.id_game,
                bets.id_team,
                teams.name_team,
                games.bo AS game_bo,  -- ✅ Utilise games au lieu de matches
                odds.odds
            FROM bets
            JOIN games ON bets.id_game = games.id_game  -- ✅ Jointure avec games
            JOIN teams ON bets.id_team = teams.id_team
            JOIN odds ON bets.id_team = odds.id_team AND bets.id_game = odds.id_game
            WHERE bets.id_user = $1 AND bets.status = 'pending'
            ORDER BY games.id_game ASC  -- ✅ Tri par id_game
        `;

        const { rows } = await pool.query(query, [userId]);
        console.log("Paris trouvés:", rows);
        res.json(rows);
    } catch (err) {
        console.error("Erreur SQL:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

import pool from "../config/db.js";
import { hashage, compareHash } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import jwt from "jsonwebtoken";

export const inscription = async (req, res) => {
    try {
        const { pseudo, email, password } = req.body;
        const passwordHashe = await hashage(password);

        // 1. Crée l'utilisateur en BDD
        const { rows } = await pool.query(
            "INSERT INTO users(username, email, password) VALUES ($1, $2, $3) RETURNING id_user, username, role",
            [pseudo, email, passwordHashe]
        );
        const user = rows[0];

        // 2. Génère un token minimaliste (sans neekos)
        const token = jwt.sign(
            { id_user: user.id_user, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // 3. Envoie le token dans un cookie + les infos utilisateur de base
        // Pour l'inscription et la connexion, utilise cette configuration :
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 3600000,
        });

        res.status(201).json({
            message: "Inscription validée ! Vous êtes maintenant connecté.",
            user: { id_user: user.id_user, username: user.username, role: user.role, neekos: user.neekos }
        });
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ error: "Erreur lors de l'inscription." });
    }
};

export const connexion = async (req, res) => {
    try {
        const { pseudo, password } = req.body;
        const query = `SELECT * FROM users WHERE username = $1`;
        const result = await pool.query(query, [pseudo]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Utilisateur non trouvé" });
        }

        const user = result.rows[0];
        const comparerMDP = await compareHash(password, user.password);

        if (comparerMDP) {
            const token = jwt.sign(
                { id_user: user.id_user, username: user.username, role: user.role, neekos: user.neekos },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            // Pour l'inscription et la connexion, utilise cette configuration :
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // ✅ Clé ici
                maxAge: 3600000,
            });

            res.json({
                message: "Connexion réussie",
                user: { id_user: user.id_user, username: user.username, role: user.role }
            });

        } else {
            return res.status(401).json({ error: "Mot de passe incorrect" });
        }
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la connexion" });
    }
};

export const getNeekos = async (req, res) => {
    try {
        const id_user = req.user.id_user;
        const query = "SELECT neekos, avatar FROM users WHERE id_user = $1";  // ✅ Requête SQL propre
        const result = await pool.query(query, [id_user]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.json({
            user: {
                id_user: req.user.id_user,
                username: req.user.username,
                role: req.user.role,
                neekos: result.rows[0].neekos,
                avatar: result.rows[0].avatar || "default.png"  // Fallback si null
            }
        });
    } catch (error) {
        console.error("Erreur SQL:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const updateAvatar = async (req, res) => {
    try {
        // 1. Récupérer l'ID de l'utilisateur depuis la requête
        const id_user = req.user.id_user;
        // 2. Récupérer le nouvel avatar depuis le body de la requête
        const { avatar } = req.body;

        // 3. Vérifier que l'avatar est fourni
        if (!avatar) {
            return res.status(400).json({ error: "L'avatar est requis." });
        }

        // 4. Mettre à jour l'avatar dans la base de données
        const updateQuery = `
            UPDATE users
            SET avatar = $1
            WHERE id_user = $2
            RETURNING avatar;
        `;
        const result = await pool.query(updateQuery, [avatar, id_user]);

        // 5. Vérifier si la mise à jour a réussi
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // 6. Retourner l'avatar mis à jour
        res.status(200).json({
            success: true,
            avatar: result.rows[0].avatar,
            message: "Avatar mis à jour avec succès."
        });

    } catch (error) {
        console.error("Erreur SQL:", error);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'avatar." });
    }
};

export const getBets = async (req, res) => {
    try {
        // 1. Vérifier que req.user est défini par le middleware
        if (!req.user || !req.user.id_user) {
            return res.status(401).json({ error: "Non autorisé : utilisateur non authentifié." });
        }

        const id_user = req.user.id_user;

        // 2. Récupérer les paris de l'utilisateur
        const query = `
            SELECT
                bets.id_bet,
                bets.amount,
                bets.status,
                bets.payout,
                teams.name_team AS team_name,
                games.id_game,
                odds.odds
            FROM bets
            JOIN games ON bets.id_game = games.id_game
            JOIN teams ON bets.id_team = teams.id_team
            JOIN odds ON bets.id_game = odds.id_game AND bets.id_team = odds.id_team
            WHERE bets.id_user = $1
            ORDER BY bets.id_bet DESC;
        `;

        const result = await pool.query(query, [id_user]);

        // 3. Retourner les paris trouvés
        res.status(200).json({
            success: true,
            bets: result.rows,
        });

    } catch (error) {
        console.error("Erreur SQL:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des paris." });
    }
};




export default { inscription, connexion, getNeekos, updateAvatar, getBets };

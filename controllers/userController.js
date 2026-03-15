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
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });
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
            res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });
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
        const query = `SELECT neekos FROM users WHERE id_user = $1`;
        const result = await pool.query(query, [id_user]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Neekos non trouvés" });
        }

        res.json({
            user: {
                id_user: req.user.id_user,
                username: req.user.username,
                role: req.user.role,
                neekos: result.rows[0].neekos
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des neekos", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des neekos" });
    }
};

export default { inscription, connexion, getNeekos };

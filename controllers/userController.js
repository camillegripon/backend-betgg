import pool from "../config/db.js";
import {hashage, compareHash} from "../utils/hash.js";
import {generateToken} from "../utils/token.js";

export const inscription = async (req, res) => {
    try {
        const {pseudo, email, password} = req.body;
        const passwordHashe = await hashage(password);
        let query= `INSERT INTO users(username, email, password) VALUES ($1, $2, $3)`;
        await pool.query(query, [pseudo, email, passwordHashe]);
        res.status(201).json({message : "Inscription validée!"});
    } catch (error){
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({ error: "Une erreur est survenue lors de l'inscription." });
    }
}

export const connexion = async (req, res) => {
    try {
        const {pseudo, email, password} = req.body;
        let query = `SELECT * FROM users WHERE username=($1)`;
        const result = await pool.query(query, [pseudo]);
        console.log(result.rows);
        if(result.rows.length === 0){
            return res.status(401).json({error: "Utilisateur non trouvé"});
        }
        const passwordHashe = result.rows[0].password;
        const comparerMDP = await compareHash(password, passwordHashe);
        if(comparerMDP){
            console.log("les mots de passe correspondent");
            const dataIdUser =  result.rows[0].id_user;
            const dataPseudo = result.rows[0].username;
            const dataRole = result.rows[0].role;
            const token = generateToken(dataIdUser, dataPseudo, dataRole);
            res.cookie('token', token, {httpOnly: true, secure: true, sameSite: 'Strict'});
            console.log("cookie envoyé", token);
            res.json({message: "Connexion réussie"});
        } else {
            console.log("Les mots de passe ne correspondent pas");
            return res.status(401).json({error: "Mot de passe incorrect"});
        }
    } catch (error){
        console.error("Erreur lors de la recherche d'utilisateur", error);
        res.status(500).json({error: "Une erreur est survenue lors de la connexion"});
    }
}

export const getNeekos = async (req, res) => {
    try {
        const id_user = req.user.id_user; 

        let query = `SELECT neekos FROM users WHERE id_user = $1`;
        const result = await pool.query(query, [id_user]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Neekos non trouvés" });
        }

        res.json({ user: { ...req.user, neekos: result.rows[0].neekos } });

    } catch (error) {
        console.error("Erreur lors de la récupération des neekos", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des neekos" });
    }
};


export default {inscription, connexion, getNeekos};
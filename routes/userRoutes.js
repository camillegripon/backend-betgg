import express from "express";
import { inscription, connexion, getNeekos, updateAvatar } from "../controllers/userController.js";
import { verifyToken } from "../utils/token.js";


const userRoutes = express.Router();

userRoutes.post("/", inscription);
userRoutes.post("/connexion", (req, res, next) => {
    console.log("connexion");
    next();
}, connexion);
userRoutes.get("/check-auth", verifyToken, getNeekos);
userRoutes.post("/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
    res.json({ message: "Déconnexion réussie" });
});
userRoutes.post("/update-avatar", verifyToken, updateAvatar);



export default userRoutes;
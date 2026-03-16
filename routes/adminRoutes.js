import express from "express";
import { getAllTeamName, pendingBos } from "../controllers/adminController.js";

const adminRoutes = express.Router();

adminRoutes.get("/", getAllTeamName);
adminRoutes.get("/pending-bos", pendingBos);

export default adminRoutes;
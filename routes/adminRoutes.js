import express from "express";
import { getAllTeamName } from "../controllers/adminController.js";

const adminRoutes = express.Router();

adminRoutes.get("/", getAllTeamName);

export default adminRoutes;
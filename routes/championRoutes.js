import express from "express";
import pool from "../config/db.js";
import getChampions from "../controllers/championController.js";

const championRoutes = express.Router();

championRoutes.get("/", getChampions);

export default championRoutes;
import express from "express";
import pool from "../config/db.js";
import { getMatches, addMatch, addBO } from "../controllers/matchController.js";

const matchRoutes = express.Router();

matchRoutes.get("/", getMatches);
matchRoutes.post("/addBO", addBO);
matchRoutes.post("/", addMatch);

export default matchRoutes;
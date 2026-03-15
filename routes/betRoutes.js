import express from "express";
import {newBet, getCurrentBets} from "../controllers/betsController.js";

const betsRoutes = express.Router();

betsRoutes.post("/", newBet);
betsRoutes.get("/current", getCurrentBets);

export default betsRoutes;
import express from "express";
import {newBet} from "../controllers/betsController.js";

const betsRoutes = express.Router();

betsRoutes.post("/", newBet);

export default betsRoutes;
import express from 'express';
import cors from 'cors';
import matchRoutes from "./routes/matchRoutes.js"
import championRoutes from "./routes/championRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import betsRoutes from './routes/betRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend en ligne !');
});
app.use("/api/matches", matchRoutes);
app.use("/api/champions", championRoutes);
app.use("/api/user", userRoutes);
app.use("/api/bets", betsRoutes);
app.use("/api/admin", adminRoutes);

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Serveur lancé sur http://localhost:${PORT}`));

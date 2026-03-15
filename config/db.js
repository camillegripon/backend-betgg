import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
pool.on('connect', () => {
console.log('Connexion à la base de données avec :', process.env.DATABASE_URL);
});

export default pool;

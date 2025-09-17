import pkg from 'pg';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log('Connexion à la base de données avec DATABASE_URL:', process.env.DATABASE_URL);

export default pool;
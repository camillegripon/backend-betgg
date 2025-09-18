import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.oejexfneznvyznjsyvlk:TtYC4NQTMmJnsJLQ@aws-1-eu-west-3.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log('Connexion à la base de données avec :', process.env.DATABASE_URL || 'aws-1-eu-west-3.pooler.supabase.com');

export default pool;

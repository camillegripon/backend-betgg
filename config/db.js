import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
host: 'db.oejexfneznvyznjsyvlk.supabase.co',
});

console.log('DATABASE_URL:', process.env.DATABASE_URL);
export default pool;

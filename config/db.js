import { Pool } from 'pg';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

// Force Node.js à utiliser IPv4 pour les requêtes DNS
dns.setDefaultResultOrder('ipv4first');

// Variable pour stocker le pool de connexions
let pool;

// Fonction pour initialiser le pool de connexions
const initializePool = async () => {
  return new Promise((resolve, reject) => {
    dns.lookup('db.oejexfneznvyznjsyvlk.supabase.co', { family: 4 }, (err, address) => {
      if (err) {
        console.error('Erreur DNS:', err);
        reject(err);
        return;
      }
      console.log('Adresse IPv4:', address);

      pool = new Pool({
        host: address,
        user: 'postgres',
        database: 'postgres',
        password: 'TtYC4NQTMmJnsJLQ',
        port: 5432,
        ssl: {
          rejectUnauthorized: false,
        },
      });
      resolve(pool);
    });
  });
}

// Initialiser le pool au démarrage
await initializePool();

export default pool;

// testController.js
import pool from '../config/db.js';

// testController.js
export const testDB = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Erreur de connexion:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

// testController.js
import dns from 'dns';

export const testDNS = async (req, res) => {
  dns.lookup('db.oejexfneznvyznjsyvlk.supabase.co', (err, address, family) => {
    if (err) {
      console.error('Erreur DNS:', err);
      return res.status(500).json({ error: 'Erreur DNS', details: err.message });
    }
    console.log('Adresse IP:', address, 'Famille:', family);
    res.json({ address, family });
  });
};

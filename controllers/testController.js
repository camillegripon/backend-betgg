import pool from '../db.js';

export const testDB = async (req, res) => {
  try {
    const client = await pool.connect();
    const { rows } = await client.query('SELECT 1');
    client.release();
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Erreur de connexion:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

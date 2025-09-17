// testController.js
import pool from '../config/db.js';

export const testDB = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 as test');
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

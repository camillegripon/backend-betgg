import dns from 'dns';

export const testDNS = (req, res) => {
  dns.lookup('db.oejexfneznvyznjsyvlk.supabase.co', { family: 4 }, (err, address, family) => {
    if (err) {
      console.error('Erreur DNS:', err);
      return res.status(500).json({ error: 'Erreur DNS', details: err.message });
    }
    console.log('Adresse IPv4:', address, 'Famille:', family);
    res.json({ address, family });
  });
};

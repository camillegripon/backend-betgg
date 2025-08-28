import jwt from 'jsonwebtoken';


export function generateToken(id_user, username, role) {
    console.log("Génération du token avec clé", process.env.JWT_SECRET);
    const token = jwt.sign({ id_user, username, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

export function verifyToken(req, res, next) {
    console.log("req.cookies:", req.cookies);
    console.log("req.headers.authorization", req.headers.authorization);
    console.log('clé secrète', process.env.JWT_SECRET);
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ error: "Token manquant" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("❌ Erreur de vérification du token :", err.message);
            return res.status(403).json({ error: "Erreur du token", details: err.message });
        }
        console.log("✅ Token valide :", decoded);
        req.user = decoded;
        next();
    });
    ;
}
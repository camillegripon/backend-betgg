import jwt from 'jsonwebtoken';


export function generateToken(id_user, username, role) {
    const token = jwt.sign({ id_user, username, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

export function verifyToken(req, res, next) {
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
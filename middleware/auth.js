import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function authToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).json({message: "Token is not Provided"});

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if(err) return res.status(403).json({message: "Invalid Token"});

        req.user = user;
        next();
    });
}

export { authToken };
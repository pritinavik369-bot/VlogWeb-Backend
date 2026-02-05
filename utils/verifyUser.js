import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

const verifyUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.access_token;
   // console.log(token, "in verify.js");

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Synchronous style
        req.user = decoded;
        console.log("verified successfully in verify.js");
        console.log("Decoded Token in verify.js:", jwt.decode(token));

        next();
    } catch (error) {
        console.error("Token Verification Error:", error.message);
        return next(errorHandler(403, 'Invalid or expired token'));
    }
};

export default verifyUser;

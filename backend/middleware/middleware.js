import { User } from '../models/user.js';
import jwt from "jsonwebtoken";

//MiddleWare that is used for components and pages that require authentication
export const middleWare = async (req, res, next) => {
    try {
        //Gets the token from the cookies
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({error: "Unauthorized: No Token Provided"});
        }
        //Verifies the token with the secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) {
            return res.status(401).json({error: "Invalid token"});
        }
        //Finds the user
        const user = await User.findById(decoded.userId).select("-password");

        if(!user) {
            return res.status(401).json({error: "User not found"});
        }
        //Add the user to the request and moves on with next function
        req.user = user;
        next();
    } 
    catch (error) {
        return res.status(500).json({error: `Internal Server Error: ${error.message}`});
    }
}
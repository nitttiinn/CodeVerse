import jwt from 'jsonwebtoken';
import { db } from "../libs/db.js";



export const authMiddleware = async (req, res,next) =>{
    try {
        const token = req.cookies.token; // get the token from the cookies

        if(!token){
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access - No token provided.'
            });
        };

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - Invalid or expired token.'
            });
        };

        const user = await db.user.findUnique({
            where : { id: decoded.id},
            select: {
                id: true,
                email: true,
                role: true,
                isVerified: true
            }
        });

        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found - The user associated with this token does not exist.'
            });
        };

        req.user = user; // attach the user to the request object
        next(); // proceed to the next middleware or route handler

    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access. Please log in.'
        });
    }
};

export const isAdmin = async (req, res, next) =>{
    const userId = req.user.id;

    if(!userId){
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access - User ID not found in request.'
        })
    }

    try{
        const user = await db.user.findUnique({
            where: {id : userId},
            select: {role: true}
        });

        if(user.role !== 'ADMIN'){
            return res.status(403).json({
                success: false,
                message: 'Forbidden - You do not have permission to perform this action.'
            });
        }
        next(); // proceed to the next middleware or route handler.
    } catch(error) {
        console.log('Authorization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error - Unable to verify user role.'
        })
    }
}
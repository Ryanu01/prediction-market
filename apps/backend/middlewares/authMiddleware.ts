import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization;
        if (!token) {
            res.status(400).json({
                message: "Missing Headers"
            })

            return;
        }
        
        
        const decode = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        console.log(decode.publicKey);
        console.log(decode);
        
        if (!decode.publicKey) {
            res.status(400).json({
                message: "Incorrect credentials"
            })
            return;
        }
        next()
    } catch (error) {
        
        res.status(401).json({
            message: "Cannot decode token"
        })
    }
}
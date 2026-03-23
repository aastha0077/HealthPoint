import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: number;
    email: string;
    role: string;
}

// Middleware to verify token
function verifyAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: "Token not found" });
        return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Token malformed" });
        return;
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || process.env.JWT || "secret"
        ) as JwtPayload;

        // @ts-ignore
        req.user = decoded;
        // @ts-ignore
        req.email = decoded.email;

        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
        return;
    }
}

function authorizeRoles(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        // @ts-ignore
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: "Access denied. Insufficient permissions." });
            return;
        }
        next();
    };
}

export { verifyAccessToken, authorizeRoles, verifyAccessToken as verifyUser };
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';

function verifyUser(req: Request, res: Response) {
    const token = req.headers.authorization;
    console.log(token)
    if (!token) {
        res.status(401).send({
            message: "token not found",
        })
        return;
    }
    const jwtToken = token.split(' ')[1];
    console.log('jwtToken')
    console.log(jwtToken);
    const email = jwt.verify(jwtToken, process.env.JWT || '');
    //@ts-ignore
    req.email = email as string;
}

export { verifyUser };
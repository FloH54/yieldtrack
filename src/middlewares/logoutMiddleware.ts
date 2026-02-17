import { Request, Response, NextFunction } from 'express';

export async function logout(req: Request, res: Response, next: NextFunction) {

    try {
        const token = req.cookies.token;
    } catch (err){
        res.status(500).json({
            status: 500,
            message : 'Internal Server Error',
    });
    }
}
import * as dotenv from "dotenv";
dotenv.config();
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

function verifyUser(req: Request, res: Response, next: NextFunction) {
	const token = req.cookies.token;
	if (!token) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!);
		req.user = decoded as { id: string; email: string; userName: string };
		return next();
	} catch {
		res.status(401).json({ error: "Invalid token" });
		return;
	}
}

export default verifyUser;

import { NextFunction, Request, Response } from "express";

function verifyUser(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

export default verifyUser;
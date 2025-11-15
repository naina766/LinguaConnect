import { Request, Response, NextFunction } from "express";
import { verifyClerkToken } from "../utils/clerkUtils";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No auth header provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    const sessionId = req.headers["x-session-id"] as string;

    if (!sessionId) {
      return res.status(401).json({ success: false, message: "No session ID provided" });
    }

    const user = await verifyClerkToken(sessionId, token);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ success: false, message: "Authentication error", error: err });
  }
};

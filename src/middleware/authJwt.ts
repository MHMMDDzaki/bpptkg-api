import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../interfaces/user.interface";

// Menambahkan tipe kustom pada object Request Express
declare global {
  namespace Express {
    interface Request {
      // Payload dari token akan memiliki properti ini
      user?: {
        userId: string;
        username: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Memverifikasi JSON Web Token (JWT) dari header Authorization.
 * Jika valid, payload akan ditambahkan ke `req.user`.
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Token has expired" });
      }
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Invalid token" });
    }
    // Menyimpan payload yang sudah di-decode ke dalam request
    req.user = decoded;
    next();
  });
};

/**
 * Memeriksa apakah user memiliki role 'superadmin'.
 * Middleware ini harus dijalankan SETELAH `verifyToken`.
 */
export const isSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Memeriksa role dari payload token yang sudah ada di req.user
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, message: "Forbidden: Requires Superadmin role" });
  }
};

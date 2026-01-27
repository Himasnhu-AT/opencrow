import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

/**
 * Auth middleware that supports two authentication methods:
 * 1. Bearer token (JWT) - for admin dashboard requests
 * 2. X-API-Key header - for widget requests from external domains
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers["x-api-key"] as string;

  // Try JWT token first
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const JWT_SECRET =
      process.env.JWT_SECRET || "default_secret_do_not_use_in_prod";

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
      (req as any).authType = "jwt";
      return next();
    } catch (error) {
      // JWT failed, continue to check API key
    }
  }

  // Try API key
  if (apiKey) {
    return validateApiKey(apiKey, req, res, next);
  }

  return res.status(401).json({
    error: "Authorization required. Provide Bearer token or X-API-Key.",
  });
}

/**
 * Middleware specifically for chat routes that allows both JWT and API key
 */
export function chatAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers["x-api-key"] as string;
  const userToken = req.body?.userToken; // User's token passed in body for proxying

  // Try JWT token first (admin dashboard)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const JWT_SECRET =
      process.env.JWT_SECRET || "default_secret_do_not_use_in_prod";

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
      (req as any).authType = "jwt";
      return next();
    } catch (error) {
      // JWT failed, continue to check API key
    }
  }

  // Try API key (widget from external domains)
  if (apiKey) {
    return validateApiKey(apiKey, req, res, next);
  }

  return res.status(401).json({
    error: "Authorization required. Provide Bearer token or X-API-Key.",
  });
}

async function validateApiKey(
  apiKey: string,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Look up API key in database
    const product = await prisma.product.findFirst({
      where: { apiKey },
    });

    if (product) {
      (req as any).product = product;
      (req as any).authType = "apiKey";
      return next();
    }

    return res.status(401).json({ error: "Invalid API key" });
  } catch (error) {
    return res.status(500).json({ error: "Error validating API key" });
  }
}

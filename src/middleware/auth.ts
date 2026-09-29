import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export const JWT_SECRET = process.env.JWT_SECRET || 'flowstate-super-secret-jwt-key-2026';

export interface AuthRequest extends Request {
  user?: typeof users.$inferSelect;
  firebaseUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Try JWT first (local email/password or demo user)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    if (decoded && decoded.userId) {
      const existingUser = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (existingUser.length > 0) {
        req.user = existingUser[0];
        return next();
      }
    }
  } catch {
    // Fall through to Firebase verification
  }

  // Try Firebase ID Token
  try {
    const decodedFirebase = await adminAuth.verifyIdToken(token);
    req.firebaseUser = decodedFirebase;

    // Synchronize or find user in Postgres
    let dbUser = await db.select().from(users).where(eq(users.uid, decodedFirebase.uid)).limit(1);

    if (dbUser.length === 0) {
      // Upsert user into database
      const inserted = await db.insert(users).values({
        uid: decodedFirebase.uid,
        name: decodedFirebase.name || decodedFirebase.email?.split('@')[0] || 'FlowState User',
        email: decodedFirebase.email || `${decodedFirebase.uid}@flowstate.app`,
        avatar: decodedFirebase.picture || `https://api.dicebear.com/7.x/shapes/svg?seed=${decodedFirebase.uid}`,
        productivityStyle: 'focused',
        workingToward: 'Startup',
        energyLevel: 'high',
        streak: 3,
        focusMinutes: 120,
      }).returning();
      req.user = inserted[0];
    } else {
      req.user = dbUser[0];
    }

    return next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }
};

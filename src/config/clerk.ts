import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.CLERK_SECRET_KEY) throw new Error('Missing Clerk API key');

export const requireAuth = ClerkExpressRequireAuth();

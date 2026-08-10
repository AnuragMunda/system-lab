/**
 * @file express.d.ts
 *
 * @description Express type augmentation exposing the authenticated `req.user`
 * payload populated by the authenticate middleware.
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        sessionId: string;
      };
    }
  }
}

export {};

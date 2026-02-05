/**
 * Optional auth: attach user when valid JWT present; never block. Guest requests have request.user = null.
 * AI routes do NOT use requireAuth — guests can use AI. Only /auth/me uses requireAuth.
 */
import { authService } from "../services/auth.service.js";

export async function authMiddleware(request, reply) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    request.user = null;
    return;
  }
  request.user = await authService.verifyToken(token);
  if (!request.user) {
    request.user = null;
  }
}

/**
 * Require authenticated user. Use on routes that must not allow guests.
 */
export async function requireAuth(request, reply) {
  if (!request.user) {
    return reply.status(401).send({ error: "Authentication required" });
  }
}

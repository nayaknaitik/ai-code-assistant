import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { userStore } from "../db/users.js";

const SALT_ROUNDS = 10;

export const authService = {
  async register(email, password) {
    const existing = await userStore.findByEmail(email);
    if (existing) {
      throw new Error("Email already registered");
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userStore.create({ email, passwordHash: hash });
    return { user: sanitizeUser(user), token: sign(user) };
  },

  async login(email, password) {
    const user = await userStore.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new Error("Invalid email or password");
    }
    return { user: sanitizeUser(user), token: sign(user) };
  },

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await userStore.findById(decoded.id);
      return user ? sanitizeUser(user) : null;
    } catch {
      return null;
    }
  },
};

function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

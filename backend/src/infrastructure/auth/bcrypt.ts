import { createHash } from "node:crypto";
import { env } from "@/config/env.js";
import bcrypt from "bcrypt";

export const hashData = async (data: string): Promise<string> => {
  return bcrypt.hash(data, env.BCRYPT_SALT_ROUNDS);
};

export const verifyData = async (
  data: string,
  dataHash: string,
): Promise<boolean> => {
  return bcrypt.compare(data, dataHash);
};

/**
 * bcrypt only considers the first 72 bytes of its input. Long secrets such as
 * refresh tokens share an identical header + payload prefix, so they must be
 * pre-hashed with SHA-256 before bcrypt to keep hash comparisons unique.
 */
const prehash = (data: string): string =>
  createHash("sha256").update(data).digest("hex");

export const hashTokenData = async (data: string): Promise<string> => {
  return bcrypt.hash(prehash(data), env.BCRYPT_SALT_ROUNDS);
};

export const verifyTokenData = async (
  data: string,
  dataHash: string,
): Promise<boolean> => {
  return bcrypt.compare(prehash(data), dataHash);
};

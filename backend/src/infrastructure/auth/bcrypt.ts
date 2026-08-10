/**
 * @file bcrypt.ts
 *
 * @description Password and token hashing helpers.
 */

import { createHash } from "node:crypto";
import { env } from "@/config/env.js";
import bcrypt from "bcrypt";

/** Hashes data with bcrypt. */
export const hashData = async (data: string): Promise<string> => {
  return bcrypt.hash(data, env.BCRYPT_SALT_ROUNDS);
};

/** Verifies a plaintext value against a bcrypt hash. */
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

/** Hashes a long secret (e.g. refresh token) for storage. */
export const hashTokenData = async (data: string): Promise<string> => {
  return bcrypt.hash(prehash(data), env.BCRYPT_SALT_ROUNDS);
};

/** Verifies a long secret against a token hash. */
export const verifyTokenData = async (
  data: string,
  dataHash: string,
): Promise<boolean> => {
  return bcrypt.compare(prehash(data), dataHash);
};

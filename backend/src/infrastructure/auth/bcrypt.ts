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

/**
 * @file index.ts
 *
 * @description Barrel for shared constants: HTTP status codes, API messages,
 * and common column length limits.
 */

export { HttpStatus } from "./httpStatus.js";
export { ApiMessages } from "./apiMessages.js";

export const NAME_LENGTH = 150;
export const EMAIL_LENGTH = 255;

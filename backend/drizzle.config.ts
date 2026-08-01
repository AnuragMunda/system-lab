/// <reference types="node" />
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const config = defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/infrastructure/database/schema/*",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

module.exports = config;

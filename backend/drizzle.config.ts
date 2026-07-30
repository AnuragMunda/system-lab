import { defineConfig } from "drizzle-kit";
require("dotenv/config");

const config = defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/infrastructure/database/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

module.exports = config;

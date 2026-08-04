/// <reference types="node" />
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const config = defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: [
    "./src/infrastructure/database/schema/architectures.ts",
    "./src/infrastructure/database/schema/projects.ts",
    "./src/infrastructure/database/schema/scenarios.ts",
    "./src/infrastructure/database/schema/sessions.ts",
    "./src/infrastructure/database/schema/simulations.ts",
    "./src/infrastructure/database/schema/users.ts",
  ],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

module.exports = config;

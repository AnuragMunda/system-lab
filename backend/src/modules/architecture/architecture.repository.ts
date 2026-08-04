import db from "@/infrastructure/database/db.js";
import { architecturesTable } from "@/infrastructure/database/schema/architectures.js";
import { CreateArchitectureRecord } from "./architecture.dto.js";
import { InternalServerError } from "@/lib/apiError.js";

export class ArchitectureRepository {
  async create(data: CreateArchitectureRecord) {
    // Implementation for saving architecture
    const [architecture] = await db
      .insert(architecturesTable)
      .values(data)
      .returning();

    if (!architecture) {
      throw InternalServerError("Failed to create architecture.");
    }

    return architecture;
  }

  async findAll() {
    return db.select().from(architecturesTable);
  }
}

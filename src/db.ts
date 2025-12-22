import pg from "pg";
import type { PoolConfig } from "pg";

// Avoid timezone-related off-by-one issues when reading DATE columns (e.g. attendance_history.date).
pg.types.setTypeParser(pg.types.builtins.DATE, (value: string) => value);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const config: PoolConfig = { connectionString };

if (process.env.PGSSL === "true") {
  config.ssl = { rejectUnauthorized: false };
}

export const db = new pg.Pool(config);

export async function connectDb(): Promise<void> {
  const client = await db.connect();
  client.release();
}

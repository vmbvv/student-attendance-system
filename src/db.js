import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Avoid timezone-related off-by-one issues when reading DATE columns (e.g. attendance_history.date).
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

const config = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.PGSSL === "true") {
  config.ssl = { rejectUnauthorized: false };
}

export const db = new pg.Client(config);

export async function connectDb() {
  await db.connect();
}

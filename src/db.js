import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

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

import "dotenv/config";
import express from "express";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./db.js";
import { userRouters } from "./routers/user.js";
import { teacherRouters } from "./routers/teacher.js";
import { studentRouters } from "./routers/student.js";

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin:
    corsOrigins.length > 0
      ? corsOrigins
      : process.env.NODE_ENV === "production"
        ? false
        : true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.use("/user", userRouters);
app.use("/teacher", teacherRouters);
app.use("/student", studentRouters);

app.get("/api/health", (_req, res) => {
  return res.json({ ok: true });
});

const port = Number(process.env.PORT) || 3000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  });

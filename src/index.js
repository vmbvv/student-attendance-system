import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./db.js";
import { userRouters } from "./routers/user.js";
import { teacherRouters } from "./routers/teacher.js";
import { studentRouters } from "./routers/student.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.use("/user", userRouters);
app.use("/teacher", teacherRouters);
app.use("/student", studentRouters);

app.get("/api/health", (req, res) => {
  return res.json({ ok: true });
});

const port = process.env.PORT || 3000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  });

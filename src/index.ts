import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { movieRouter } from "./movies/routes.ts";

// Express app
const app = express();
app.use(bodyParser.json());

app.use("/movie", movieRouter);

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://chimgeeerka_db_user:kwMcgOO287Fj4jZE@cluster0.fha1wxi.mongodb.net/sample_mflix"
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err: Error) => {
    console.error("MongoDB connection error:", err);
  });

app.listen(3000, () => console.log("Server running on port 3000"));
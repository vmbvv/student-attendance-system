import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getMyAttendance,
  changePassword,
  getStudentProfile,
} from "../controllers/student.js";

export const studentRouters = Router();

studentRouters.use(requireAuth, requireRole("student"));

studentRouters.get("/attendance", getMyAttendance);
studentRouters.patch("/password", changePassword);
studentRouters.get("/profile", getStudentProfile);

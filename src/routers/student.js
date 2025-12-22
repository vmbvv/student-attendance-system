import { Router } from "express";
import { requireAuth, requireParamUserId, requireRole } from "../middleware/auth.js";
import {
  getMyAttendance,
  changePassword,
  getStudentProfile,
} from "../controllers/student.js";

export const studentRouters = new Router();

studentRouters.use(
  "/:studentId",
  requireAuth,
  requireRole("student"),
  requireParamUserId("studentId")
);

studentRouters.get("/:studentId/attendance", getMyAttendance);
studentRouters.patch("/:studentId/password", changePassword);
studentRouters.get("/:studentId/profile", getStudentProfile);

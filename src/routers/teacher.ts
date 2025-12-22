import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getStudents,
  createStudent,
  deleteStudent,
  getTeacherProfile,
  changeTeacherPassword,
} from "../controllers/teacher.js";
import {
  upsertAttendance,
  getAttendanceByDate,
  getTeacherSummary,
  getStudentAttendanceHistory,
} from "../controllers/attendance.js";

export const teacherRouters = Router();

teacherRouters.use(requireAuth, requireRole("teacher"));

teacherRouters.get("/students", getStudents);
teacherRouters.post("/students", createStudent);
teacherRouters.delete("/students/:studentId", deleteStudent);
teacherRouters.get("/profile", getTeacherProfile);
teacherRouters.patch("/password", changeTeacherPassword);
teacherRouters.get(
  "/students/:studentId/attendance-history",
  getStudentAttendanceHistory
);
teacherRouters.put("/attendance", upsertAttendance);
teacherRouters.get("/attendance", getAttendanceByDate);
teacherRouters.get("/summary", getTeacherSummary);

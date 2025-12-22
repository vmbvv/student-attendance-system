import { Router } from "express";
import { requireAuth, requireParamUserId, requireRole } from "../middleware/auth.js";
import {
  getStudents,
  createStudent,
  deleteStudent,
  getTeacherProfile,
} from "../controllers/teacher.js";
import {
  upsertAttendance,
  getAttendanceByDate,
  getTeacherSummary,
  getStudentAttendanceHistory,
} from "../controllers/attendance.js";

export const teacherRouters = new Router();

teacherRouters.use(
  "/:teacherId",
  requireAuth,
  requireRole("teacher"),
  requireParamUserId("teacherId")
);

teacherRouters.get("/:teacherId/students", getStudents);
teacherRouters.post("/:teacherId/students", createStudent);
teacherRouters.delete("/:teacherId/students/:studentId", deleteStudent);
teacherRouters.get("/:teacherId/profile", getTeacherProfile);
teacherRouters.get(
  "/:teacherId/students/:studentId/attendance-history",
  getStudentAttendanceHistory
);
teacherRouters.put("/:teacherId/attendance", upsertAttendance);
teacherRouters.get("/:teacherId/attendance", getAttendanceByDate);
teacherRouters.get("/:teacherId/summary", getTeacherSummary);

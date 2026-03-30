import {
  addAttendance,
  getAllHoliday,
  getMyAttendance,
  tomarrowHoliday,
  todayAttendance,
  checkAttendanceStatus,
} from "../controllers/attendance_controller.js";
import {
  authenticationHandler,
  employeeOnly,
} from "../../middleware/verify_token.js";
import express from "express";

const router = express.Router();

router.post(
  "/employee/attendance/add",
  authenticationHandler,
  employeeOnly,
  addAttendance,
);

router.post(
  "/employee/attendance/today",
  authenticationHandler,
  employeeOnly,
  todayAttendance,
);

router.post(
  "/employee/attendance/status",
  authenticationHandler,
  employeeOnly,
  checkAttendanceStatus,
);


router.post(
  "/employee/attendance/list",
  authenticationHandler,
  employeeOnly,
  getMyAttendance,
);
router.post(
  "/employee/holiday/list",
  authenticationHandler,
  employeeOnly,
  getAllHoliday,
);

router.post(
  "/employee/holiday/tomarrow",
  authenticationHandler,
  employeeOnly,
  tomarrowHoliday,
);

export default router;

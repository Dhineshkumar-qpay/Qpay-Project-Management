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
  employeeOrManager,
} from "../../middleware/verify_token.js";
import express from "express";

const router = express.Router();

router.post(
  "/employee/attendance/add",
  authenticationHandler,
  employeeOrManager,
  addAttendance,
);

router.post(
  "/employee/attendance/today",
  authenticationHandler,
  employeeOrManager,
  todayAttendance,
);

router.post(
  "/employee/attendance/status",
  authenticationHandler,
  employeeOrManager,
  checkAttendanceStatus,
);


router.post(
  "/employee/attendance/list",
  authenticationHandler,
  employeeOrManager,
  getMyAttendance,
);
router.post(
  "/employee/holiday/list",
  authenticationHandler,
  employeeOrManager,
  getAllHoliday,
);

router.post(
  "/employee/holiday/tomarrow",
  authenticationHandler,
  employeeOrManager,
  tomarrowHoliday,
);

export default router;

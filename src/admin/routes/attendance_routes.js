import {
  addHoliday,
  deleteHoliday,
  getAllAttendancelogs,
  getAllHoliday,
  getTodayAttendancelogs,
  updateHoliday,
  updateAttendance,
} from "../controllers/attendance_controller.js";
import {
  adminOnly,
  adminOrManagerOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";
import express from "express";

const router = express.Router();

router.post(
  "/attendance/list",
  authenticationHandler,
  adminOrManagerOnly,
  getAllAttendancelogs,
);

router.post(
  "/attendance/today",
  authenticationHandler,
  adminOrManagerOnly,
  getTodayAttendancelogs,
);

router.post(
  "/attendance/update",
  authenticationHandler,
  adminOrManagerOnly,
  updateAttendance,
);


router.post("/holiday/add", authenticationHandler, adminOrManagerOnly, addHoliday);
router.post("/holiday/update", authenticationHandler, adminOrManagerOnly, updateHoliday);
router.post("/holiday/delete", authenticationHandler, adminOrManagerOnly, deleteHoliday);
router.post("/holiday/list", authenticationHandler, adminOrManagerOnly, getAllHoliday);

export default router;

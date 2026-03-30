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
  authenticationHandler,
} from "../../middleware/verify_token.js";
import express from "express";

const router = express.Router();

router.post(
  "/attendance/list",
  authenticationHandler,
  adminOnly,
  getAllAttendancelogs,
);

router.post(
  "/attendance/today",
  authenticationHandler,
  adminOnly,
  getTodayAttendancelogs,
);

router.post(
  "/attendance/update",
  authenticationHandler,
  adminOnly,
  updateAttendance,
);


router.post("/holiday/add", authenticationHandler, adminOnly, addHoliday);
router.post("/holiday/update", authenticationHandler, adminOnly, updateHoliday);
router.post("/holiday/delete", authenticationHandler, adminOnly, deleteHoliday);
router.post("/holiday/list", authenticationHandler, adminOnly, getAllHoliday);

export default router;

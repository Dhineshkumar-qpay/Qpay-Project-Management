import express from "express";
import {
  employeeLogin,
  getProfile,
  getTodayBirthday,
  updateProfile,
} from "../../employee/controllers/auth_controller.js";
import { profileImageUpload } from "../../admin/controllers/employee_controller.js";
import {
  authenticationHandler,
  employeeOrManager,
} from "../../middleware/verify_token.js";

const router = express.Router();

router.post("/employee/login", employeeLogin);

router.post(
  "/employee/profile",
  authenticationHandler,
  employeeOrManager,
  getProfile,
);
router.post(
  "/employee/update-profile",
  authenticationHandler,
  employeeOrManager,
  profileImageUpload.single("profileimage"),
  updateProfile,
);
router.post(
  "/employee/today-birthday",
  authenticationHandler,
  employeeOrManager,
  getTodayBirthday,
);

export default router;

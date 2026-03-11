import express from "express";
import {
  employeeLogin,
  getProfile,
  updateProfile,
} from "../../employee/controllers/auth_controller.js";
import { upload } from "../../admin/controllers/employee_controller.js";
import {
  authenticationHandler,
  employeeOnly,
} from "../../middleware/verify_token.js";

const router = express.Router();

router.post("/employee/login", employeeLogin);

router.post(
  "/employee/profile",
  authenticationHandler,
  employeeOnly,
  getProfile,
);
router.post(
  "/employee/update-profile",
  authenticationHandler,
  employeeOnly,
  upload.single("profileimage"),
  updateProfile,
);

export default router;

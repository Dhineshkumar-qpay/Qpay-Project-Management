import express from "express";
import {
  adminOnly,
  adminOrManagerOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";

import {
  addEmployee,
  profileImageUpload,
  updateEmployee,
  getEmployees,
  deleteEmployee,
  updateEmployeeStatus,
} from "../controllers/employee_controller.js";

const router = express.Router();

router.post(
  "/employees/add",
  authenticationHandler,
  adminOrManagerOnly,
  profileImageUpload.single("profile"),
  addEmployee,
);

router.post(
  "/employees/update",
  authenticationHandler,
  adminOrManagerOnly,
  profileImageUpload.single("profile"),
  updateEmployee,
);

router.post("/employees/list", authenticationHandler, adminOrManagerOnly, getEmployees);

router.post(
  "/employees/delete",
  authenticationHandler,
  adminOrManagerOnly,
  deleteEmployee,
);
router.post(
  "/employees/update-status",
  authenticationHandler,
  adminOrManagerOnly,
  updateEmployeeStatus,
);

export default router;

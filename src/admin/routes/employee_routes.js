import express from "express";
import {
  adminOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";

import {
  addEmployee,
  upload,
  updateEmployee,
  getEmployees,
  deleteEmployee,
  updateEmployeeStatus,
} from "../controllers/employee_controller.js";

const router = express.Router();

router.post(
  "/employees/add",
  authenticationHandler,
  adminOnly,
  upload.single("profile"),
  addEmployee,
);

router.post(
  "/employees/update",
  authenticationHandler,
  adminOnly,
  upload.single("profile"),
  updateEmployee,
);

router.post("/employees/list", authenticationHandler, adminOnly, getEmployees);

router.post(
  "/employees/delete",
  authenticationHandler,
  adminOnly,
  deleteEmployee,
);
router.post(
  "/employees/update-status",
  authenticationHandler,
  adminOnly,
  updateEmployeeStatus,
);

export default router;

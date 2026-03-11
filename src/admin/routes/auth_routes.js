import express from "express";
import { adminLogin, adminRegister } from "../controllers/authcontroller.js";

const router = express.Router();

router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);

export default router;

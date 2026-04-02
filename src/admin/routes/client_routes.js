import express from "express";
import {
  adminOnly,
  adminOrManagerOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";

import {
  addClient,
  updateClient,
  listClient,
  deleteClient,
  updateClientStatus,
} from "../controllers/client_controller.js";

const router = express.Router();

router.post("/clients/add", authenticationHandler, adminOrManagerOnly, addClient);

router.post("/clients/update", authenticationHandler, adminOrManagerOnly, updateClient);

router.post("/clients/list", authenticationHandler, adminOrManagerOnly, listClient);

router.post("/clients/delete", authenticationHandler, adminOrManagerOnly, deleteClient);

router.post(
  "/clients/update-status",
  authenticationHandler,
  adminOrManagerOnly,
  updateClientStatus,
);

export default router;

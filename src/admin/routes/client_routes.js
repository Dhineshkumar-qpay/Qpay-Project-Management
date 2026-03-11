import express from "express";
import {
  adminOnly,
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

router.post("/clients/add", authenticationHandler, adminOnly, addClient);

router.post("/clients/update", authenticationHandler, adminOnly, updateClient);

router.post("/clients/list", authenticationHandler, adminOnly, listClient);

router.post("/clients/delete", authenticationHandler, adminOnly, deleteClient);

router.post(
  "/clients/update-status",
  authenticationHandler,
  adminOnly,
  updateClientStatus,
);

export default router;

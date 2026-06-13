import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshAccessController,
  registerController,
} from "../controller/auth.controller";

const router = Router();

router.post("/login", loginController);
router.post("/refresh", refreshAccessController);
router.post("/logout", logoutController);
router.post("/register", registerController);

export default router;

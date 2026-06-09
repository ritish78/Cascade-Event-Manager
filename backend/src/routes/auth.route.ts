import { Router } from "express";
import { login, logout, refreshAccess } from "../controller/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/refresh", refreshAccess);
router.post("/logout", logout);

export default router;

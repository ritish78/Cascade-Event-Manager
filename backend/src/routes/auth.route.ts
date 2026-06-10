import { Router } from "express";
import { login, logout, refreshAccess, register } from "../controller/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/refresh", refreshAccess);
router.post("/logout", logout);
router.post("/register", register);

export default router;

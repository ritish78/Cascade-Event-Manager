import { Router } from "express";
import { login, refreshAccess } from "../controller/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/refresh", refreshAccess);

export default router;

import { Router } from "express";
import { getAllTagsController } from "../controller/tag.controller";

const router = Router();

router.get("/", getAllTagsController);

export default router;

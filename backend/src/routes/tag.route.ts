import { Router } from "express";
import { getAllTagsController } from "src/controller/tag.controller";

const router = Router();

router.get("/", getAllTagsController);

export default router;

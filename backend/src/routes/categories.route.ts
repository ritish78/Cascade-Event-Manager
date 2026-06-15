import { Router } from "express";
import { getAllCategoriesController } from "src/controller/category.controller";

const router = Router();

router.get("/", getAllCategoriesController);

export default router;

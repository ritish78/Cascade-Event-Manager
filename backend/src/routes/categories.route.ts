import { Router } from "express";
import { getAllCategoriesController } from "../controller/category.controller";

const router = Router();

router.get("/", getAllCategoriesController);

export default router;

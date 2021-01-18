import { Router } from "express";
import { protect } from "../controllers/auth.controller";
import { createBarang, getAllBarang, uploadImageBarang } from "../controllers/barang.controller";
const router = Router();

router.use(protect);

router.get("/", getAllBarang);
router.post("/", uploadImageBarang, createBarang);

export default router;

import { Router } from "express";
import { protect } from "../controllers/auth.controller";
import {
  createBarang,
  getAllBarang,
  uploadImageBarang,
  updateBarang,
  deleteBarang,
} from "../controllers/barang.controller";
const router = Router();

router.use(protect);

router.get("/", getAllBarang);
router.post("/", uploadImageBarang, createBarang);
router.put("/:id", uploadImageBarang, updateBarang);
router.delete("/", deleteBarang);

export default router;

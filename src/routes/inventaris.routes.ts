import { Router } from "express";
import { protect } from "../controllers/auth.controller";
import { generateKodeBarang, checkKodeBarang, createInventBarang } from "../controllers/inventaris.controller";

const router = Router();

// router.use(protect);

router.get("/generate/:jenis", generateKodeBarang);
router.get("/check-kode/:kodeBarang", checkKodeBarang);
router.post("/", createInventBarang);

export default router;

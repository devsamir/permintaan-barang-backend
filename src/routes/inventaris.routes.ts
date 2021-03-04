import { Router } from "express";
import { protect } from "../controllers/auth.controller";
import {
  generateKodeBarang,
  checkKodeBarang,
  createInventBarang,
  getTotalBarang,
  getDetailTotalBarang,
  getAllRuangan,
  deleteDetailBarang,
  nonaktifkanBarang,
  pindahBarang,
  riwayatBarang,
} from "../controllers/inventaris.controller";

const router = Router();

// router.use(protect);

router.get("/total", getTotalBarang);
router.get("/detail/:barang", getDetailTotalBarang);
router.get("/ruangan", getAllRuangan);
router.get("/generate/:jenis", generateKodeBarang);
router.get("/check-kode/:kodeBarang", checkKodeBarang);
router.get("/riwayat/:id", riwayatBarang);
router.post("/", createInventBarang);
router.delete("/", deleteDetailBarang);
router.put("/nonaktif/:id", nonaktifkanBarang);
router.put("/pindah/:id", pindahBarang);

export default router;

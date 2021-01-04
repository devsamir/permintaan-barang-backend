import { Router } from "express";
import { login, cekJwt } from "../controllers/auth.controller";
const router = Router();

router.post("/login", login);
router.post("/jwt", cekJwt);

export default router;

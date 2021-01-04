import { Router } from "express";
import { createUser, getAllUser } from "../controllers/user.controller";
const router = Router();

router.get("/", getAllUser);
router.post("/", createUser);

export default router;

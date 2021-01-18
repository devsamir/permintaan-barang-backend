import { Router } from "express";
import { createUser, getAllUser, deleteUser, getOneUser } from "../controllers/user.controller";
import { protect } from "../controllers/auth.controller";
const router = Router();

router.get("/", protect, getAllUser);
router.post("/", protect, createUser);
router.get("/:id", protect, getOneUser);
router.delete("/:id", protect, deleteUser);

export default router;

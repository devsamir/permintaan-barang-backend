import { Router } from "express";
import { createUser, getAllUser, deleteUser, getOneUser } from "../controllers/user.controller";
import { protect, restrictTo } from "../controllers/auth.controller";
const router = Router();

router.get("/", protect, restrictTo("admin"), getAllUser);
router.post("/", protect, restrictTo("admin"), createUser);
router.get("/:id", protect, restrictTo("admin"), getOneUser);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

export default router;

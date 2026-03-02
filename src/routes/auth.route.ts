import { Router } from "express";
import {
  register,
  login,
  uploadProfileImage,
  updateProfile,
  getProfile, // ✅ ADD THIS
} from "../controllers/auth.controller";

import { uploads } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// ✅ ADD THIS ROUTE
router.get("/profile", authorizedMiddleware, getProfile);

router.post(
  "/profile/upload",
  authorizedMiddleware,
  uploads.single("profileImage"),
  uploadProfileImage,
);

router.put(
  "/:id",
  authorizedMiddleware,
  uploads.single("image"),
  updateProfile,
);

export default router;

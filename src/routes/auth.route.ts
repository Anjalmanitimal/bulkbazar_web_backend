import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { uploads } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/auth.middleware";
import { uploadProfileImage } from "../controllers/auth.controller";
import { updateProfile } from "../controllers/auth.controller";
import { getProfile } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
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
router.get("/profile", authorizedMiddleware, getProfile);
export default router;

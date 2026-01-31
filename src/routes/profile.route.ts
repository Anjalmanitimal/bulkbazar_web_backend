import { Router } from "express";
import { uploads } from "../middlewares/upload.middleware";
import {
  getProfile,
  uploadProfileImage,
} from "../controllers/profile.controller";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const router = Router();


router.get("/profile", authorizedMiddleware, getProfile);
router.post(
  "/profile/upload",
  authorizedMiddleware,
  uploads.single("image"),
  uploadProfileImage,
);

export default router;

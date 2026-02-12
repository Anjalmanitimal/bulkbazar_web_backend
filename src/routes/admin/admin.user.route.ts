import { Router } from "express";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../../middlewares/auth.middleware";
import { uploads } from "../../middlewares/upload.middleware";
import { AdminUserController } from "../../controllers/admin/user.controller";

const router = Router();
const controller = new AdminUserController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.post(
  "/",
  uploads.single("image"),
  controller.createUser.bind(controller),
);
router.get("/", controller.getAllUsers.bind(controller));
router.get("/:id", controller.getUserById.bind(controller));
router.put(
  "/:id",
  uploads.single("image"),
  controller.updateUser.bind(controller),
);
router.delete("/:id", controller.deleteUser.bind(controller));

export default router;

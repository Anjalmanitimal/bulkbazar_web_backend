import { Router } from "express";
import { createProduct, getProducts } from "../controllers/product.controller";
import { uploadProductImage } from "../middlewares/productUpload.middleware";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  authorizedMiddleware,
  uploadProductImage.single("image"),
  createProduct,
);

router.get("/", getProducts);

export default router;

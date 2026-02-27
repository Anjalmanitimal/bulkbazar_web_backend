import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getSellerProducts,
} from "../controllers/product.controller";
import { uploadProductImage } from "../middlewares/productUpload.middleware";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  authorizedMiddleware,
  uploadProductImage.single("image"),
  createProduct,
);

// Public products (customer)
router.get("/", getProducts);

// Seller products
router.get("/seller", authorizedMiddleware, getSellerProducts);

// Delete product
router.delete("/:id", authorizedMiddleware, deleteProduct);

router.get("/:id", getProductById);

export default router;

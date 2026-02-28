import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getSellerProducts,
  updateProduct, // ✅ ADD THIS
} from "../controllers/product.controller";

import { uploadProductImage } from "../middlewares/productUpload.middleware";
import { authorizedMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Create product
router.post(
  "/",
  authorizedMiddleware,
  uploadProductImage.single("image"),
  createProduct,
);

// Get all products (public)
router.get("/", getProducts);

// Seller products
router.get("/seller", authorizedMiddleware, getSellerProducts);

// Get product by ID
router.get("/:id", getProductById);

// ✅ UPDATE PRODUCT ROUTE (THIS WAS MISSING)
router.put(
  "/:id",
  authorizedMiddleware,
  uploadProductImage.single("image"),
  updateProduct,
);

// Delete product
router.delete("/:id", authorizedMiddleware, deleteProduct);

export default router;

import { Request, Response } from "express";
import {
  createProductService,
  getProductsService,
} from "../services/product.service";
import { HttpError } from "../errors/http.error";
import { ProductModel } from "../models/product.model";

/* ================= CREATE PRODUCT ================= */

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    if (req.user.role !== "seller") {
      throw new HttpError(403, "Only sellers can create products");
    }

    if (!req.file) throw new HttpError(400, "Image required");

    const imagePath = `/uploads/products/${req.file.filename}`;

    const product = await createProductService({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      pricing: JSON.parse(req.body.pricing),
      image: imagePath,
      sellerId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (e: any) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ================= GET ALL PRODUCTS ================= */

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await getProductsService();

    res.json({
      success: true,
      data: products,
    });
  } catch (e: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ================= GET SELLER PRODUCTS ================= */

export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    if (req.user.role !== "seller") {
      throw new HttpError(403, "Only sellers can access this resource");
    }

    const products = await ProductModel.find({
      sellerId: req.user.userId,
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (e: any) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ================= GET PRODUCT BY ID ================= */

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (e: any) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ================= UPDATE PRODUCT ================= */

export const updateProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    if (req.user.role !== "seller") {
      throw new HttpError(403, "Only sellers can update products");
    }

    const productId = req.params.id;

    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct) throw new HttpError(404, "Product not found");

    if (existingProduct.sellerId.toString() !== req.user.userId) {
      throw new HttpError(403, "Not allowed to update this product");
    }

    const updateData: any = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      pricing: req.body.pricing
        ? JSON.parse(req.body.pricing)
        : existingProduct.pricing,
    };

    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true },
    );

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (e: any) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ================= DELETE PRODUCT ================= */

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    if (req.user.role !== "seller") {
      throw new HttpError(403, "Only sellers can delete products");
    }

    const product = await ProductModel.findById(req.params.id);

    if (!product) throw new HttpError(404, "Product not found");

    if (product.sellerId.toString() !== req.user.userId) {
      throw new HttpError(403, "Not allowed to delete this product");
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (e: any) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

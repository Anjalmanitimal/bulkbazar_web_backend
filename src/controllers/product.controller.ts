import { Request, Response } from "express";
import {
  createProductService,
  getProductsService,
} from "../services/product.service";
import { HttpError } from "../errors/http.error";
import { ProductModel } from "../models/product.model";

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

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
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  const products = await getProductsService();

  res.json({
    success: true,
    data: products,
  });
};

export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    const products = await ProductModel.find({
      sellerId: req.user.userId,
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    const product = await ProductModel.findOneAndDelete({
      _id: req.params.id,
      sellerId: req.user.userId,
    });

    if (!product) throw new HttpError(404, "Product not found");

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

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
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

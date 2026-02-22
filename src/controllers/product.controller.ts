import { Request, Response } from "express";
import {
  createProductService,
  getProductsService,
} from "../services/product.service";
import { HttpError } from "../errors/http.error";

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    if (!req.file) throw new HttpError(400, "Image required");

    const imagePath = `/uploads/products/${req.file.filename}`;

    const product = await createProductService({
      name: req.body.name,
      description: req.body.description,
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

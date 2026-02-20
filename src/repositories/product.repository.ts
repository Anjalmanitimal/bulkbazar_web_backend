import { ProductModel } from "../models/product.model";

export const createProduct = async (data: any) => {
  return await ProductModel.create(data);
};

export const getAllProducts = async () => {
  return await ProductModel.find().sort({ createdAt: -1 });
};

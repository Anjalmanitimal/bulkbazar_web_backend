import {
  createProduct,
  getAllProducts,
} from "../repositories/product.repository";

export const createProductService = async (data: any) => {
  return await createProduct(data);
};

export const getProductsService = async () => {
  return await getAllProducts();
};

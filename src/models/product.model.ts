import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../types/user.types";

export interface PricingTier {
  moq: number;
  price: number;
}

export interface ProductDocument extends Document {
  name: string;
  description: string;
  image: string;
  pricing: PricingTier[];
  sellerId: mongoose.Types.ObjectId;
}

const PricingSchema = new Schema({
  moq: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const ProductSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    pricing: {
      type: [PricingSchema],
      required: true,
    },

    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ProductModel = mongoose.model<ProductDocument>(
  "Product",
  ProductSchema,
);

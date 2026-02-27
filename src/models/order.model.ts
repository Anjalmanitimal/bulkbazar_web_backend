import mongoose, { Schema, Document } from "mongoose";

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface OrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  image: String,
  quantity: Number,
  price: Number,
});

const OrderSchema = new Schema<OrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [OrderItemSchema],

    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true },
);

export const OrderModel = mongoose.model<OrderDocument>("Order", OrderSchema);

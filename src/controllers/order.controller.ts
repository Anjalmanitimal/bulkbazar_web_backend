import { Request, Response } from "express";
import { OrderModel } from "../models/order.model";
import { HttpError } from "../errors/http.error";

export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    const { items, total } = req.body;

    if (!items || items.length === 0) throw new HttpError(400, "Cart empty");

    const order = await OrderModel.create({
      userId: req.user.userId,
      items,
      total,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    const orders = await OrderModel.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ensure user deletes only their own order
    if (order.userId.toString() !== req.user?.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await OrderModel.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};

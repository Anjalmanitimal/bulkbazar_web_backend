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

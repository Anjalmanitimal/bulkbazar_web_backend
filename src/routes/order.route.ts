import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  deleteOrder,
} from "../controllers/order.controller";

import { authorizedMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authorizedMiddleware, createOrder);

router.get("/my-orders", authorizedMiddleware, getMyOrders);

router.delete("/:id", authorizedMiddleware, deleteOrder);

export default router;

import { Router } from "express";
import { createOrder } from "../controllers/order.controller";
import { authorizedMiddleware } from "../middlewares/auth.middleware";
import { getMyOrders } from "../controllers/order.controller";

const router = Router();

router.post("/", authorizedMiddleware, createOrder);

router.get("/my-orders", authorizedMiddleware, getMyOrders);

export default router;

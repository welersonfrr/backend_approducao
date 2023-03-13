import { Router } from "express";
import { OrderController } from "../controller/order.controller";

export const orderRoutes = () => {
  const app = Router();

  app.get("/", new OrderController().getAllOrders);
  app.get("/op", new OrderController().getSingleOrder);

  return app;
};

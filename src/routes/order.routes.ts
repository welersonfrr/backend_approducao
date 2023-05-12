import { Router } from "express";
import { OrderController } from "../controller/order.controller";
import { ProductionController } from "../controller/production.controller";

export const orderRoutes = () => {
  const app = Router();

  app.get("/", new OrderController().getAllOrders);
  app.get("/op", new OrderController().getSingleOrder);
  app.get("/production", new ProductionController().getProductions);
  app.get("/details", new ProductionController().getDetails);
  app.post("/production", new ProductionController().postProduction);
  app.get("/production/lastProd", new ProductionController().getLastProduction);
  app.get(
    "/production/lastNumber",
    new ProductionController().getLastProductionNumber
  );
  app.get("/production/resume", new ProductionController().getResumeProduction);
  app.get(
    "/production/confirmation",
    new ProductionController().getAllNonConfirmed
  );
  app.post(
    "/production/confirmation",
    new ProductionController().postConfirmOp
  );

  return app;
};

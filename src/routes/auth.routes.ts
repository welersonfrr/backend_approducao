import { Router } from "express";
import { AuthController } from "../controller/auth.controller";

export const authRoutes = () => {
  const app = Router();
  app.post("/", new AuthController().validAuth);

  return app;
};

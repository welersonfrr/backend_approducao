import express from "express";
import * as dotenv from "dotenv";
import { orderRoutes } from "./routes/order.routes";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    sucess: true,
    msg: "Api express approducao online.",
    data: [],
  });
});

app.use("/order", orderRoutes());

app.listen(process.env.PORT, () => {
  console.log(`Express esta rodando na porta ${process.env.PORT}`);
});

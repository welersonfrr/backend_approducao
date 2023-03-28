import express from "express";
import * as dotenv from "dotenv";
import { orderRoutes } from "./routes/order.routes";
import { authRoutes } from "./routes/auth.routes";
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    sucess: true,
    msg: "Api approducao online.",
    data: [],
  });
});

app.use("/order", orderRoutes());
app.use("/auth", authRoutes());

app.listen(process.env.PORT, () => {
  console.log(`Express esta rodando na porta ${process.env.PORT}`);
});

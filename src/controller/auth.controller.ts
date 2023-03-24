const PocketBase = require("pocketbase/cjs");
import { Request, Response } from "express";
import { Auth } from "../models/auth.model";
import * as dotenv from "dotenv";

dotenv.config();

const pb = new PocketBase(process.env.POCKETBASE);

export class AuthController {
  public async validAuth(req: Request, res: Response) {
    console.log("\r\n****************");

    const body = req.body;
    console.log(`Trying to auth user: ${body.username}`);

    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(body.username, body.password);

      // after the above you can also access the auth data from the authStore
      console.log(pb.authStore.isValid);
      console.log(pb.authStore.token);
      console.log(pb.authStore.model.id);
      pb.authStore.clear();

      return res.status(200).send({
        sucess: true,
        msg: "User valid",
        data: authData,
      });
    } catch (error: any) {
      if (error.status === 400) {
        console.log("Failed to authenticate");
        return res.status(400).send({
          sucess: false,
          msg: error.toString(),
        });
      } else {
        return res.status(500).send({
          sucess: false,
          msg: error.toString(),
        });
      }
    }
  }
}

const PocketBase = require("pocketbase/cjs");
const axios = require("axios");
import { Request, Response } from "express";
import { Order } from "../models/order.model";
import * as dotenv from "dotenv";

dotenv.config();

const pb = new PocketBase(process.env.POCKETBASE);

export class OrderController {
  public async getAllOrders(req: Request, res: Response) {
    try {
      const records = await pb.collection("order").getFullList({
        sort: "-created",
      });

      return res.status(200).send({
        sucess: true,
        msg: "Order controller",
        data: records,
      });
    } catch (error: any) {
      return res.status(500).send({
        sucess: false,
        msg: error.toString(),
      });
    }
  }

  public async getSingleOrder(req: Request, res: Response) {
    const { op, filial } = req.query;
    console.log(`\r\n********************`);
    console.log(`Searcing op: ${op}`);

    try {
      const record = await pb
        .collection("order")
        .getFirstListItem(`op='${op}' && filial='${filial}'`);

      const filteredRec: Order = new Order(
        record.filial,
        record.op,
        record.codigo,
        record.codbel,
        record.produto,
        record.qtdpad,
        record.lote,
        record.dtvalidade
      );
      console.log(`Op found (PB): ${op}`);

      return res.status(200).send({
        sucess: true,
        msg: "Data found",
        data: filteredRec,
      });
    } catch (error: any) {
      if ((error.status = 404)) {
        console.log(`PB not found, searching in Protheus...`);
        axios
          .get(`${process.env.PROTHEUS}?filial=${filial}&prodOrder=${op}`, {
            auth: {
              username: process.env.PROT_USER,
              password: process.env.PROT_PASS,
            },
          })
          .then(async function (response: any) {
            if (response.data["ORDER001"].length == 0) {
              console.log(`OP not found.`);
              return res.status(404).send({
                sucess: false,
                msg: "Data not found",
              });
            } else {
              console.log(`OP found, inserting in pocketbase....`);
              const protheusRet: Order = new Order(
                response.data["ORDER001"][0].FILIAL.trim(),
                response.data["ORDER001"][0].OP.trim(),
                response.data["ORDER001"][0].CODIGO.trim(),
                response.data["ORDER001"][0].CODBEL.trim(),
                response.data["ORDER001"][0].PRODUTO.trim(),
                response.data["ORDER001"][0].QTDPAD,
                response.data["ORDER001"][0].LOTE.trim(),
                response.data["ORDER001"][0].DTVALIDADE.trim()
              );

              try {
                await pb.collection("order").create(protheusRet);
                console.log(`OP sucessfully inserted to Pocketbase.`);
              } catch (error: any) {
                console.log(`Error while inserting in Pocketbase, error:`);
                console.log(error.toString());

                return res.status(500).send({
                  sucess: false,
                  msg: error.toString(),
                });
              }

              return res.status(200).send({
                sucess: true,
                msg: "Data found",
                data: protheusRet,
              });
            }
          })
          .catch(function (error: any) {
            console.log(error.toString());
            return res.status(500).send({
              sucess: false,
              msg: error.toString(),
            });
          });
      }
    }
  }
}

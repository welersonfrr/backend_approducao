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
                response.data["ORDER001"][0].CODBEL,
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

  public async getMachineData(req: Request, res: Response) {
    const { filial, op } = req.query;

    const getImage = async (product: string) => {
      const notFound = `${process.env.NOT_FOUND_IMG}`;

      try {
        const record = await pb
          .collection("images")
          .getFirstListItem(`product = '${product}'`);

        const link = `${process.env.FILE_PATH}/${record.collectionId}/${record.id}/${record.file}`;
        return link;
      } catch (error: any) {
        if (error.status == 404) {
          return notFound;
        } else {
          return "";
        }
      }
    };

    const getValues = async () => {
      let ret = {
        pallet: 0,
        total: 0,
        first: {
          data: "##/##/####",
          hora: "##:##",
        },
        last: {
          data: "##/##/####",
          hora: "##:##",
        },
        producoes: [],
      };

      const formatData = (data: string) => {
        return `${data.substr(6, 2)}/${data.substr(4, 2)}/${data.substr(0, 4)}`;
      };

      try {
        const records = await pb.collection("production").getFullList({
          filter: `filial = '${filial}' && op = '${op}'`,
          $autoCancel: false,
        });

        if (records.length > 0) {
          const pallets = records.length;
          const total = records.reduce((acc: number, record: any) => {
            return acc + Number(record.quantidade);
          }, 0);

          ret = {
            pallet: pallets,
            total: total,
            producoes: records,
            first: {
              data: formatData(records[0].dt_inicio),
              hora: records[0].hr_inicio,
            },
            last: {
              data: formatData(records[records.length - 1].dt_fim),
              hora: records[records.length - 1].hr_fim,
            },
          };
          return ret;
        } else {
          return ret;
        }
      } catch (error) {
        console.log(error);
        return ret;
      }
    };

    try {
      const record = await pb
        .collection("order")
        .getFirstListItem(`filial='${filial}' && op='${op}'`);

      const img = await getImage(record.codigo);
      const values = await getValues();

      const data = {
        id: record.id,
        op: record.op,
        lote: record.lote,
        codigo: record.codigo,
        produto: record.produto,
        qtdPad: record.qtdpad,
        validade: record.validade,
        img: img,
        pallet: values.pallet,
        producoes: values.total,
      };
      return res.status(200).send({
        sucess: true,
        msg: "Order Route: getMachineData",
        data: data,
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
                response.data["ORDER001"][0].CODBEL,
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

              const record = await pb
                .collection("order")
                .getFirstListItem(`filial='${filial}' && op='${op}'`);

              const img = await getImage(record.codigo);
              const values = await getValues();

              const data = {
                id: record.id,
                op: record.op,
                lote: record.lote,
                codigo: record.codigo,
                produto: record.produto,
                qtdPad: record.qtdpad,
                validade: record.validade,
                img: img,
                pallet: values.pallet,
                producoes: values.total,
              };
              return res.status(200).send({
                sucess: true,
                msg: "Order Route: getMachineData",
                data: data,
              });
            }
          })
          .catch(function (error: any) {
            console.log(error.toString());
            return res.status(500).send({
              sucess: false,
              msg: "Order Route: getMachineData",
              data: error.toString(),
            });
          });
      } else {
        console.log("Error while get details");
        return res.status(500).send({
          sucess: false,
          msg: "Order Route: getMachineData",
          data: error.toString(),
        });
      }
    }
  }
}

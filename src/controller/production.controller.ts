const PocketBase = require("pocketbase/cjs");
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import { Production } from "../models/production.model";

dotenv.config();

const pb = new PocketBase(process.env.POCKETBASE);

export class ProductionController {
  public async getAllProduction(req: Request, res: Response) {
    const { op, filial } = req.query;

    try {
      let searchParams;
      if (op != undefined && filial != undefined) {
        searchParams = {
          filter: `filial = '${filial}' && op = '${op}'`,
          sort: "-created",
        };
      } else {
        searchParams = {
          sort: "-created",
        };
      }

      const records = await pb
        .collection("production")
        .getFullList(searchParams);
      return res.status(200).send({
        sucess: true,
        msg: "Production Route: getAllProduction",
        data: records,
      });
    } catch (error: any) {
      return res.status(500).send({
        sucess: false,
        msg: "Production Route",
        data: error.toString(),
      });
    }
  }

  public async getLastProduction(req: Request, res: Response) {
    const { op, filial } = req.query;

    try {
      const resultList = await pb.collection("production").getList(1, 1, {
        filter: `filial = '${filial}' && op = '${op}'`,
        sort: "-created",
      });
      return res.status(200).send({
        sucess: true,
        msg: "Production Route: getLastProduction",
        data: resultList,
      });
    } catch (error: any) {
      return res.status(500).send({
        sucess: false,
        msg: "Production Route: getLastProduction",
        data: error.toString(),
      });
    }
  }

  public async getLastProductionNumber(req: Request, res: Response) {
    const { op, filial } = req.query;

    try {
      const resultList = await pb.collection("production").getList(1, 1, {
        filter: `filial = '${filial}' && op = '${op}'`,
        sort: "-created",
      });

      const filteredRec =
        resultList["items"][0] == undefined ? 0 : resultList["items"][0].numero;

      return res.status(200).send({
        sucess: true,
        msg: "Production Route: getLastProductionNumber",
        data: filteredRec,
      });
    } catch (error: any) {
      return res.status(500).send({
        sucess: false,
        msg: "Production Route: getLastProductionNumber",
        data: error.toString(),
      });
    }
  }

  public async postProduction(req: Request, res: Response) {
    const nextProductionData = async (body: any) => {
      console.log(`\r\n********************`);
      console.log("Trying to post new production...");

      const now = new Date();
      const month = [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
      ];
      try {
        const resultList = await pb.collection("production").getList(1, 1, {
          filter: `filial = '${body.filial}' && op = '${body.op}'`,
          sort: "-created",
        });

        if (resultList["items"][0] == undefined) {
          const timer = new Date(now.getTime() - 40 * 60 * 1000);

          const data = {
            dataini: `${timer.getFullYear()}${
              month[timer.getMonth()]
            }${timer.getDate()}`,
            hrini: `${timer.getHours()}:${timer.getMinutes()}`,
            datafim: `${now.getFullYear()}${
              month[now.getMonth()]
            }${now.getDate()}`,
            hrfim: `${now.getHours()}:${now.getMinutes()}`,
            numero: 1,
          };

          return data;
        } else {
          const data = {
            dataini: resultList["items"][0].dt_fim,
            hrini: resultList["items"][0].hr_fim,
            numero: resultList["items"][0].numero + 1,
            datafim: `${now.getFullYear()}${
              month[now.getMonth()]
            }${now.getDate()}`,
            hrfim: `${now.getHours()}:${now.getMinutes()}`,
          };

          return data;
        }
      } catch (error: any) {
        console.log(error.toString());
      }
    };

    const body = req.body;

    const productionData = await nextProductionData(body);

    try {
      const data = {
        filial: body.filial,
        op: body.op,
        codigo: body.codigo,
        produto: body.produto,
        lote: body.lote,
        dt_validade: body.dt_validade,
        quantidade: body.quantidade,
        dt_inicio: productionData?.dataini,
        hr_inicio: productionData?.hrini,
        dt_fim: productionData?.datafim,
        hr_fim: productionData?.hrfim,
        usuario: body.usuario,
        numero: productionData?.numero,
      };

      const record = await pb.collection("production").create(data);
      const productionFiltered = new Production(
        record.id,
        record.filial,
        record.op,
        record.codigo,
        record.produto,
        record.lote,
        record.dt_validade,
        record.quantidade,
        record.dt_inicio,
        record.hr_inicio,
        record.dt_fim,
        record.hr_fim,
        record.usuario,
        record.numero
      );
      console.log("Production successfully inserted");
      return res.status(200).send({
        sucess: true,
        msg: "Production Route: postProduction",
        data: productionFiltered,
      });
    } catch (error: any) {
      console.log("Error while inserting production");
      return res.status(500).send({
        sucess: false,
        msg: "Production Route: postProduction",
        data: error.toString(),
      });
    }
  }
}

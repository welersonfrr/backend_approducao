const PocketBase = require("pocketbase/cjs");
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import { Production } from "../models/production.model";
import { ResumeProduction } from "../models/resumeProduction.model";

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

  public async getResumeProduction(req: Request, res: Response) {
    const { qtd, filial } = req.query;
    let returnData: any = [];
    let opData: any = [];
    let qtdPallet = 0;
    let dt_inicio = 0;
    let hr_inicio = 0;
    let dt_fim = 0;
    let hr_fim = 0;
    let obs = "";

    try {
      console.log(
        `Trying to get last ${qtd} productions from filial ${filial}`
      );

      const opDataResultList = await pb.collection("order").getList(1, qtd, {
        filter: `filial =  '${filial}'`,
        sort: "-created",
      });

      opDataResultList.items.forEach((e: any) => {
        const singleProduction = {
          confirmado: e.confirmado,
          filial: e.filial,
          op: e.op,
          codigo: e.codigo,
          produto: e.produto,
          lote: e.lote,
          obs: e.obs,
        };
        opData = [...opData, singleProduction];
      });

      for (let index = 0; index < opData.length; index++) {
        const totalProdRecords = await pb.collection("production").getFullList({
          sort: "-created",
          filter: `op = '${opData[index].op}' && filial = '${opData[index].filial}'`,
        });

        const lastIndex =
          totalProdRecords.length === 1 ? 0 : totalProdRecords.length - 1;

        const total = totalProdRecords.reduce((acc: number, record: any) => {
          qtdPallet += 1;
          return acc + Number(record.quantidade);
        }, 0);
        if (totalProdRecords[0] === undefined) {
          dt_inicio = 0;
          hr_inicio = 0;
          dt_fim = 0;
          hr_fim = 0;
        } else {
          dt_inicio = totalProdRecords[lastIndex].dt_inicio;
          hr_inicio = totalProdRecords[lastIndex].hr_inicio;
          dt_fim = totalProdRecords[0].dt_fim;
          hr_fim = totalProdRecords[0].hr_fim;
        }

        const data = new ResumeProduction(
          opData[index].confirmado,
          opData[index].filial,
          opData[index].op,
          opData[index].codigo,
          opData[index].produto,
          opData[index].lote,
          total,
          qtdPallet,
          dt_inicio,
          hr_inicio,
          dt_fim,
          hr_fim,
          opData[index].obs
        );

        returnData = [...returnData, data];
        qtdPallet = 0;
      }

      return res.status(200).send({
        sucess: true,
        msg: "Production Route: getResumeProduction",
        data: returnData,
      });
    } catch (error: any) {
      console.log("Error while consulting production");
      return res.status(500).send({
        sucess: false,
        msg: "Production Route: getResumeProduction",
        data: error.toString(),
      });
    }
  }

  public async getAllNonConfirmed(req: Request, res: Response) {
    const { filial } = req.query;
    const promisses: any = [];
    let nonConfirmedData: Array<any> = [];
    let dt_inicio = 0;
    let hr_inicio = 0;
    let dt_fim = 0;
    let hr_fim = 0;

    try {
      const records = await pb.collection("order").getFullList({
        sort: "-created",
        filter: `filial = '${filial}' && confirmado != true`,
      });

      for (const record of records) {
        const totalProdRecords = await pb.collection("production").getFullList({
          sort: "-created",
          filter: `op = '${record.op}' && filial = '${record.filial}'`,
          $autoCancel: false,
        });

        const qtdProducao = totalProdRecords.reduce(
          (acc: number, record: any) => {
            return acc + Number(record.quantidade);
          },
          0
        );

        const qtdPallet = totalProdRecords.reduce(
          (acc: number, record: any) => {
            return acc + 1;
          },
          0
        );

        if (totalProdRecords[0] != undefined) {
          dt_inicio = totalProdRecords[0].dt_inicio;
          hr_inicio = totalProdRecords[0].hr_inicio;
          dt_fim = totalProdRecords[qtdPallet - 1].dt_fim;
          hr_fim = totalProdRecords[qtdPallet - 1].hr_fim;
        }
        const nonConfirmed = new Production(
          record.id,
          record.filial,
          record.op,
          record.codigo,
          record.produto,
          record.lote,
          record.dt_validade,
          qtdProducao,
          dt_inicio,
          hr_inicio,
          dt_fim,
          hr_fim,
          undefined,
          qtdPallet
        );

        nonConfirmedData = [...nonConfirmedData, nonConfirmed];
      }

      return res.status(200).send({
        sucess: true,
        msg: "Production Route: getAllNonConfirmed",
        data: nonConfirmedData,
      });
    } catch (error: any) {
      console.log("Error while consulting production");
      return res.status(500).send({
        sucess: false,
        msg: "Production Route: getAllNonConfirmed",
        data: error.toString(),
      });
    }
  }

  public async postConfirmOp(req: Request, res: Response) {
    const body = req.body;
    console.log(body);

    try {
      console.log(`Trying to post confirmation on id ${body.recId}`);
      const record = await pb.collection("order").getOne(body.recId);

      Object.keys(record).forEach((key) => {
        if (key === "obs") {
          record[key] = body.obs;
        }
        if (key === "confirmado") {
          record[key] = true;
        }
      });

      const updatedRec = await pb
        .collection("order")
        .update(body.recId, record);
      return res.status(200).send({
        sucess: true,
        msg: "Production Route: postConfirmOp",
        data: updatedRec,
      });
    } catch (error: any) {
      console.log("Error while posting production");
      return res.status(500).send({
        sucess: false,
        msg: "Production Route: postConfirmOp",
        data: error.toString(),
      });
    }
  }
}

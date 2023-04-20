export class ResumeProduction {
  constructor(
    public confirmado: boolean,
    public filial: string,
    public op: string,
    public codigo: string,
    public produto: string,
    public lote: string,
    public quantidade: number,
    public producoes: number,
    public dt_inicio: number,
    public hr_inicio: number,
    public dt_fim: number,
    public hr_fim: number,
    public obs: string
  ) {
    this.confirmado;
    this.filial;
    this.op;
    this.codigo;
    this.produto;
    this.lote;
    this.quantidade;
    this.producoes;
    this.dt_inicio;
    this.hr_inicio;
    this.dt_fim;
    this.hr_fim;
    this.obs;
  }
}

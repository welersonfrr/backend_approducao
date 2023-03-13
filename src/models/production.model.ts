export class Production {
  constructor(
    public filial: string,
    public op: string,
    public codigo: string,
    public produto: string,
    public lote: string,
    public dtvalidade: string,
    public quantidade: number,
    public dt_inicio: number,
    public hr_inicio: number,
    public dt_fim: number,
    public hr_fim: number,
    public usuario: number
  ) {
    this.filial;
    this.op;
    this.codigo;
    this.produto;
    this.lote;
    this.dtvalidade;
    this.quantidade;
    this.dt_inicio;
    this.hr_inicio;
    this.dt_fim;
    this.hr_fim;
    this.usuario;
  }
}

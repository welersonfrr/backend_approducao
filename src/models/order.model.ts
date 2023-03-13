export class Order {
  constructor(
    public filial: string,
    public op: string,
    public codigo: string,
    public produto: string,
    public lote: string,
    public dtvalidade: string
  ) {
    this.filial;
    this.op;
    this.codigo;
    this.produto;
    this.lote;
    this.dtvalidade;
  }

  public toJson() {
    return {
      filial: this.filial,
      op: this.op,
      codigo: this.codigo,
      produto: this.produto,
      lote: this.lote,
      dtvalidade: this.dtvalidade,
    };
  }
}

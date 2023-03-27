export class Order {
  constructor(
    public filial: string,
    public op: string,
    public codigo: string,
    public codbel: string,
    public produto: string,
    public qtdpad: string,
    public lote: string,
    public dtvalidade: string
  ) {
    this.filial;
    this.op;
    this.codigo;
    this.codbel;
    this.produto;
    this.qtdpad;
    this.lote;
    this.dtvalidade;
  }

  public toJson() {
    return {
      filial: this.filial,
      op: this.op,
      codigo: this.codigo,
      codbel: this.codbel,
      produto: this.produto,
      qtdpad: this.qtdpad,
      lote: this.lote,
      dtvalidade: this.dtvalidade,
    };
  }
}

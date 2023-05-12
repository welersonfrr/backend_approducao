export class ProductionCard {
  constructor(
    public id: string,
    public img: string,
    public op: string,
    public cod: string,
    public pallet: number,
    public total: number,
    public firstDt: string
  ) {
    this.id;
    this.img;
    this.op;
    this.cod;
    this.pallet;
    this.total;
    this.firstDt;
  }

  public toJson() {
    return {
      id: this.id,
      img: this.img,
      op: this.op,
      cod: this.cod,
      pallet: this.pallet,
      total: this.total,
      firstDt: this.firstDt,
    };
  }
}

export class DateArray {
  constructor(public date: string, public values: Array<Object>) {
    this.date;
    this.values;
  }
  public toJson() {
    return {
      date: this.date,
      values: this.values,
    };
  }
}

import format from "date-fns/format";

export default class DataCollection {
  constructor(data) {
    this.data = data;
  }

  atDates(dates) {
    return new DateCollection(
      this.data.filter(
        data =>
          dates.map(d => format(d, "yyyy-MM-dd")).indexOf(data.tanggal) > -1
      )
    );
  }

  pluck(key) {}

  sum(key = null) {
    const reducer = (sum, v) => parseFloat(v) ? sum + parseFloat(v) : sum;
    return key === null
      ? this.data.reduce(reducer, 0)
      : this.data.map(d => d[key]).reduce(reducer, 0);
  }

  avg(key = null) {
    return this.sum(key) / this.data.length;
  }
}

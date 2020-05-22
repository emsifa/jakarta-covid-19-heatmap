import addDays from "date-fns/addDays";
import format from "date-fns/format";

export default class DateUtil {
  constructor(activeDate) {
    this.date = date;
  }

  now() {
    return new DateUtil(new Date());
  }

  add(count) {
    return addDays(this.date, count);
  }

  next(daysAfter) {
    return this.add(daysAfter);
  }

  prev(daysBefore) {
    return this.add(-1 * daysBefore);
  }

  range(from, to = null) {
    const resolve = (date, defaultValue) =>
      date === null
        ? defaultValue
        : typeof date === "number"
        ? this.add(date)
        : date;

    from = resolve(from, this.add(-1));
    to = resolve(to);

    if (from.getTimestamp() > to.getTimestamp()) {
      [from, to] = [to, from];
    }

    let date = new Date(from);
    const range = [];
    while (date.getTimestamp() <= to.getTimestamp()) {
      range.push(date);
      date = addDays(date, 1);
    }
    return range;
  }
}

import codes from './codes';

export interface Indicators {
  [indicator: string]: number;
}

export interface Alerts {
  [stock: string]: Indicators;
}

export interface Query {
  pageSize: number;
  currentPage: number;
  totalPages: number;
  codes: string[];
}

export interface Result {
  meta: Query;
  result: Alerts;
}

export default abstract class Crawler {
  protected _codes: string[] = [];
  constructor() {
    this._codes = codes;
  }
  protected filterRSI(rsi: number): number | undefined {
    if (rsi > 70 || rsi < 30) return rsi;
    return undefined;
  }

  protected composeAlerts(alerts: Alerts) {
    let text = "Today's Alerts<br>";

    Object.keys(alerts).map((code) => {
      if (Object.keys(alerts[code]).length > 0) {
        text += `${code}: <br>`;
        Object.keys(alerts[code]).map((indicator) => {
          text += `${indicator} : ${alerts[code][indicator]} <br>`;
        });
        text += '------------------------------------<br>';
      }
    });

    return text;
  }

  protected pagination(pageSize: number, currentPage: number): Query {
    return {
      pageSize: pageSize,
      currentPage: currentPage,
      totalPages: Math.ceil(this._codes.length / pageSize),
      codes: this._codes.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      ),
    };
  }

  abstract extractIndicators(rawHtml: string): Indicators;
}

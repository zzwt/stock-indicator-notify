import axios from 'axios';
import cheerio from 'cheerio';
import codes from './codes';

interface Indicators {
  [indicator: string]: number;
}

interface Alerts {
  [stock: string]: Indicators;
}

interface Query {
  pageSize: number;
  currentPage: number;
  totalPages: number;
  codes: string[];
}

export interface Result {
  meta: Query;
  result: Alerts;
}

abstract class Crawler {
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

export class BarchartCrawler extends Crawler {
  query: Query = { pageSize: 1, currentPage: 1, totalPages: 1, codes: [''] };

  constructor(private _pageSize: number, private _currentPage: number) {
    super();
    this.query = this.pagination(_pageSize, _currentPage);
    this.query.codes = this.codePreProcess(this.query.codes);
  }

  private codePreProcess(codes: string[]) {
    return codes.map((code) => (Number.parseInt(code[0]) ? `A-${code}` : code));
  }

  public async start() {
    return await Promise.all(
      this.query.codes.map(async (code) => {
        try {
          const rawHtml = await this.getRawHtml(code);
          const indicators = this.extractIndicators(rawHtml);
          const value: [string, Indicators] = [code, indicators];

          return Promise.resolve(value);
        } catch (error) {
          console.log(`error processing code${code}`);
        }
      })
    ).then((values: ([string, Indicators] | undefined)[]) => {
      let errorCount = 0;
      let alerts: Alerts = {};
      values.map((value: [string, Indicators] | undefined) => {
        if (value) {
          if (Object.keys(value[1]).length > 0) alerts[value[0]] = value[1];
        } else errorCount += 1;
      });
      console.log(`Error Code Count: ${errorCount}`);
      const val: Result = {
        meta: this.query,
        result: alerts,
      };
      return val;
    });
  }

  async getRawHtml(code: string) {
    const url = `https://www.barchart.com/stocks/quotes/${code}.AX/technical-analysis`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    return response.data;
  }

  private parseRSI(rawHtml: string) {
    const $ = cheerio.load(rawHtml);
    const indicators = $('.analysis-table-wrapper.bc-table-wrapper')
      .eq(2)
      .find('.even')
      .eq(0)
      .find('td')
      .eq(1);
    return Number.parseFloat(indicators.text().split('%')[0]);
  }

  extractIndicators(rawHtml: string) {
    const results: Indicators = {};
    const rsi = this.filterRSI(this.parseRSI(rawHtml));
    if (rsi) results['rsi'] = rsi;
    return results;
  }
}

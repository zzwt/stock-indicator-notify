import axios from 'axios';
import cheerio from 'cheerio';

import Crawler, { Query, Alerts, Indicators, Result } from './crawler';

export default class BarchartCrawler extends Crawler {
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
          // Step 1: get Raw html
          const rawHtml = await this.getRawHtml(code);
          // Step 2: extract indicators
          const indicators = this.extractIndicators(rawHtml);
          const value: [string, Indicators] = [code, indicators];

          return Promise.resolve(value);
        } catch (error) {
          console.log(`error processing code${code}`);
        }
      })
    ).then((values: ([string, Indicators] | undefined)[]) => {
      // Step 3: Reduce alerts if no indicator alerts are triggered
      const alerts = this.reduceAlerts(values);
      // Step 4: Add query meta data to final return value
      return this.appendMeta(alerts);
    });
  }

  private reduceAlerts(values: ([string, Indicators] | undefined)[]): Alerts {
    let errorCount = 0;
    let alerts: Alerts = {};
    values.map((value: [string, Indicators] | undefined) => {
      if (value) {
        if (Object.keys(value[1]).length > 0) alerts[value[0]] = value[1];
      } else errorCount += 1;
    });
    console.log(`Error Code Count: ${errorCount}`);
    return alerts;
  }

  private appendMeta(alerts: Alerts): Result {
    const val: Result = {
      meta: this.query,
      result: alerts,
    };
    return val;
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

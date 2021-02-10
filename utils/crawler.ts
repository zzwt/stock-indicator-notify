import axios from 'axios';
import cheerio from 'cheerio';
import codes from './codes';
import sgMail from '@sendgrid/mail';

interface Indicators {
  [indicator: string]: number;
}

interface Alerts {
  [stock: string]: Indicators;
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
    let text = '';

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

  abstract extractIndicators(rawHtml: string): Indicators;
  abstract processIndicators(alerts: Alerts): void;
}

export class BarchartCrawler extends Crawler {
  constructor() {
    super();
    this._codes = this.codePreProcess(this._codes);
  }

  private codePreProcess(codes: string[]) {
    return codes.map((code) => (Number.parseInt(code[0]) ? `A-${code}` : code));
  }

  public async start() {
    await Promise.all(
      this._codes.map(async (code) => {
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
        if (value) alerts[value[0]] = value[1];
        else errorCount += 1;
      });
      console.log(`Error Code Count: ${errorCount}`);
      this.processIndicators(alerts);
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

  processIndicators(alerts: Alerts) {
    const text = this.composeAlerts(alerts);
    this.sendEmail(text);
  }

  private sendEmail(text: string) {
    if (process.env.SENDGRID_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_KEY);
      const msg = {
        to: process.env.TO_EMAIL || '', // Change to your recipient
        from: process.env.FROM_EMAIL || '', // Change to your verified sender
        subject: 'Daily Stock Indicators Alerts',
        text: 'hi there',
        html: text,
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent');
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
}

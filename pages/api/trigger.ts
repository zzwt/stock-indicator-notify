import type { NextApiRequest, NextApiResponse } from 'next';
import { BarchartCrawler } from './../../utils/crawler';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { AppSecret } = req.body;
    if (AppSecret === process.env.APP_SECRET) {
      const crawler = new BarchartCrawler();
      await crawler.start();
      return res.send({ msg: 'success' });
    }
    return res.send({ msg: 'Secret is not corrent', error: true });
  } else {
    return res.send({ msg: 'Method not supported', error: true });
  }
};

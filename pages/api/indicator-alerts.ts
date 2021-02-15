import type { NextApiRequest, NextApiResponse } from 'next';
import BarchartCrawler from '../../utils/BarchartCrawler';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { AppSecret, pageSize, currentPage } = req.body;
    if (AppSecret === process.env.APP_SECRET) {
      const crawler = new BarchartCrawler(pageSize, currentPage);
      const result = await crawler.start();
      return res.status(200).send(result);
    }
    return res.status(500).send({ msg: 'Secret is not corrent', error: true });
  } else {
    return res.status(405).send({ msg: 'Method not supported', error: true });
  }
};

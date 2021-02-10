import express, { Response, Request } from 'express';
import bodyParser from 'body-parser';
import { BarchartCrawler } from './crawler';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/trigger', async (req: Request, res: Response) => {
  const { AppSecret } = req.body;
  if (AppSecret === process.env.APP_SECRET) {
    const crawler = new BarchartCrawler();
    await crawler.start();
    return res.send({ msg: 'success' });
  }
  return res.send({ msg: 'Secret is not corrent', error: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('server listening on port: ', PORT);
});

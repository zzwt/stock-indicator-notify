import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { AppSecret } = req.body;
    if (AppSecret === process.env.APP_SECRET) {
      return res.status(200).send(await pipiDreamStep());
    }
    return res.status(500).send({ msg: 'Secret is not corrent', error: true });
  } else {
    return res.status(405).send({ msg: 'Method not supported', error: true });
  }
};

// Below is pipedream steps.nodejs code just copy & paste into pipedream
async function pipiDreamStep() {
  async function sendRequest(AppSecret, pageSize, currentPage) {
    const hostname = process.env.HOSTNAME;
    const fetchResult = await axios.post(`${hostname}/api/indicator-alerts`, {
      AppSecret: AppSecret,
      pageSize: pageSize,
      currentPage: currentPage,
    });
    console.log(fetchResult.data);
    const result = fetchResult.data;
    return result;
  }

  function composeAlerts(alerts) {
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

  const axios = require('axios');

  let pageSize = 25;
  let AppSecret = process.env.APP_SECRET;
  let currentPage = 1;
  let combinedIndicators = {};

  const {
    meta: { totalPages },
    result: resultFirst,
  } = await sendRequest(AppSecret, pageSize, currentPage);

  combinedIndicators = { ...combinedIndicators, ...resultFirst };

  while (currentPage <= totalPages) {
    const { result: resultAfter } = await sendRequest(
      AppSecret,
      pageSize,
      currentPage.toString()
    );
    combinedIndicators = { ...combinedIndicators, ...resultAfter };
    currentPage += 1;
  }
  return composeAlerts(combinedIndicators);
}

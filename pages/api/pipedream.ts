import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { AppSecret, pageSize, currentPage } = req.body;
    let combinedIndicators = {};
    const {
      meta: { totalPages },
      result: resultFirst,
    } = await sendRequest(AppSecret, pageSize, currentPage);

    combinedIndicators = { ...combinedIndicators, ...resultFirst };
    let currentPageNum = Number.parseInt(currentPage);
    while (currentPageNum <= totalPages) {
      const { result: resultAfter } = await sendRequest(
        AppSecret,
        pageSize,
        currentPageNum.toString()
      );
      combinedIndicators = { ...combinedIndicators, ...resultAfter };
      currentPageNum += 1;
    }

    return res.status(200).send(combinedIndicators);
  } else {
    return res.status(405).send({ msg: 'Method not supported', error: true });
  }
};

async function sendRequest(
  AppSecret: string,
  pageSize: string,
  currentPage: string
) {
  const fetchResult = await axios.post('http://localhost:3000/api/trigger', {
    AppSecret: AppSecret,
    pageSize: pageSize,
    currentPage: currentPage,
  });
  console.log(fetchResult.data);
  const result = fetchResult.data;
  return result;
}

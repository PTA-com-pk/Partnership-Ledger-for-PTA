import { NextApiRequest, NextApiResponse } from 'next';
import { debugGoogleSheet } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await debugGoogleSheet();
    res.status(200).json({ message: 'Debug completed, check server logs' });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
}

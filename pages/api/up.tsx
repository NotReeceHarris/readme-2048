import { NextApiRequest, NextApiResponse } from 'next';
import { moveTiles, getGameState } from '../../lib/game';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const moved = moveTiles('up');
  
  /* res.status(200).json({ 
    success: moved,
    board: getGameState().board // Return the current board for debugging
  }); */

  res.redirect(307, 'https://github.com/NotReeceHarris').end();
}
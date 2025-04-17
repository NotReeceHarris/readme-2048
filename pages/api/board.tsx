import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas } from 'canvas';
import { getGameState } from '../../lib/game';

const tileColors: Record<number, string> = {
    0: '#cdc1b4',
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
};

const getTextColor = (value: number) => value <= 4 ? '#776e65' : '#f9f6f2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const gameState = getGameState();
    const gap = 12;
    const tileSize = 90;
    const boardSize = 4;

    const width = (tileSize * boardSize) + (gap * (boardSize + 1));
    const height = (tileSize * boardSize) + (gap * (boardSize + 1));

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(0, 0, width, height);

    // Draw tiles
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const value = gameState.board[row * boardSize + col];
            const x = gap + col * (tileSize + gap);
            const y = gap + row * (tileSize + gap);

            // Tile background
            ctx.fillStyle = tileColors[value] || '#3c3a32';
            ctx.beginPath();
            ctx.roundRect(x, y, tileSize, tileSize, 6); // 6px rounded corners
            ctx.fill();

            // Tile value
            if (value !== 0) {
                ctx.fillStyle = getTextColor(value);
                ctx.font = `${value < 100 ? 48 : 36}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(value.toString(), x + tileSize / 2, y + tileSize / 2);
            }
        }
    }

    // Send PNG buffer
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
}
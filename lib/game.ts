// Simple in-memory store (for demo - in production use Redis or database)
let gameState = {
    board: Array(16).fill(0) as number[],
    score: 0,
    gameOver: false
};

// Initialize with 2 random tiles
function initializeGame() {
    gameState.board = Array(16).fill(0);
    addRandomTile();
    addRandomTile();
    gameState.score = 0;
    gameState.gameOver = false;
}

function addRandomTile() {
    const emptyCells = gameState.board
        .map((val, idx) => val === 0 ? idx : -1)
        .filter(idx => idx !== -1);

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gameState.board[randomCell] = Math.random() < 0.9 ? 2 : 4;
    }
}

function moveTiles(direction: 'up' | 'down' | 'left' | 'right') {
    if (gameState.gameOver) return false;

    const oldBoard = [...gameState.board];
    const size = 4; // 4x4 grid

    // Helper function to get value at (row, col)
    const get = (row: number, col: number) => gameState.board[row * size + col];
    // Helper function to set value at (row, col)
    const set = (row: number, col: number, value: number) => gameState.board[row * size + col] = value;

    // Process each row or column based on direction
    for (let i = 0; i < size; i++) {
        let tiles: number[] = [];

        // Extract the relevant row or column
        for (let j = 0; j < size; j++) {
            tiles.push(
                direction === 'up' ? get(j, i) :
                    direction === 'down' ? get(size - 1 - j, i) :
                        direction === 'left' ? get(i, j) :
                            get(i, size - 1 - j)
            );
        }

        // Merge tiles
        let merged = mergeTiles(tiles);

        // Put back the merged tiles
        for (let j = 0; j < size; j++) {
            const value = merged[j] || 0;
            if (direction === 'up') {
                set(j, i, value);
            } else if (direction === 'down') {
                set(size - 1 - j, i, value);
            } else if (direction === 'left') {
                set(i, j, value);
            } else {
                set(i, size - 1 - j, value);
            }
        }
    }

    // Check if board changed
    const moved = !oldBoard.every((val, idx) => val === gameState.board[idx]);

    if (moved) {
        addRandomTile();
        checkGameOver();
    }

    return moved;
}

function mergeTiles(tiles: number[]): number[] {
    // Filter out zeros
    let nonZeroTiles = tiles.filter(val => val !== 0);
    let merged: number[] = [];
    let scoreToAdd = 0;

    for (let i = 0; i < nonZeroTiles.length; i++) {
        if (i < nonZeroTiles.length - 1 && nonZeroTiles[i] === nonZeroTiles[i + 1]) {
            // Merge tiles
            const newValue = nonZeroTiles[i] * 2;
            merged.push(newValue);
            scoreToAdd += newValue;
            i++; // Skip next tile
        } else {
            merged.push(nonZeroTiles[i]);
        }
    }

    // Add zeros to maintain size
    while (merged.length < tiles.length) {
        merged.push(0);
    }

    // Update score
    gameState.score += scoreToAdd;

    return merged;
}

function checkGameOver() {
    const size = 4;
    const board = gameState.board;

    // Check for any empty spaces
    if (board.some(tile => tile === 0)) {
        gameState.gameOver = false;
        return;
    }

    // Check for possible merges in rows
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size - 1; col++) {
            if (board[row * size + col] === board[row * size + col + 1]) {
                gameState.gameOver = false;
                return;
            }
        }
    }

    // Check for possible merges in columns
    for (let col = 0; col < size; col++) {
        for (let row = 0; row < size - 1; row++) {
            if (board[row * size + col] === board[(row + 1) * size + col]) {
                gameState.gameOver = false;
                return;
            }
        }
    }

    // No moves left
    gameState.gameOver = true;
}

// Initialize game on server start
initializeGame();

export { gameState, initializeGame, moveTiles };


// Export a function to get the current state
export function getGameState() {
    return gameState;
}

// Export a function to set the state (for testing)
export function setGameState(newState: typeof gameState) {
    gameState = { ...newState };
}
// AI Logic Functions
// These functions are not React components, but utility functions for AI moves.

// Function to calculate the winner of the game
export const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
};

// AI Move Strategies
export const findWinningMove = (board, symbol) => {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = symbol;
      if (calculateWinner(testBoard)?.winner === symbol) return i;
    }
  }
  return null;
};

export const findBlockingMove = (board, playerSymbol, aiSymbol) => {
  // To block, find if the opponent (playerSymbol) has a winning move
  return findWinningMove(board, playerSymbol);
};

export const findRandomMove = (board) => {
  const emptySquares = board.reduce((acc, square, index) =>
    square === null ? [...acc, index] : acc, []);
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
};

// Minimax Algorithm for Hard Difficulty
export const minimax = (board, depth, isMaximizing, aiSymbol, playerSymbol) => {
  const result = calculateWinner(board);

  if (result) {
    if (result.winner === aiSymbol) return 10 - depth;
    if (result.winner === playerSymbol) return depth - 10;
  }

  if (board.every(square => square !== null)) return 0; // Draw

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = aiSymbol;
        let score = minimax(board, depth + 1, false, aiSymbol, playerSymbol);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = playerSymbol;
        let score = minimax(board, depth + 1, true, aiSymbol, playerSymbol);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

// Helper functions for medium difficulty
export const findCenterMove = (board) => {
  return board[4] === null ? 4 : null;
};

export const findCornerMove = (board) => {
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => board[i] === null);
  return availableCorners.length > 0 ?
    availableCorners[Math.floor(Math.random() * availableCorners.length)] :
    null;
};


// AI Move Selection
export const aiMove = (board, currentDifficulty, aiSymbol, playerSymbol, playSoundCallback) => {
  if (playSoundCallback) playSoundCallback('click');

  const emptySquares = board.reduce((acc, square, index) =>
    square === null ? [...acc, index] : acc, []);

  let move = null;

  const validDifficulty = ['easy', 'medium', 'impossible'].includes(currentDifficulty)
    ? currentDifficulty
    : 'medium';

  switch (validDifficulty) {
    case 'easy':
      if (Math.random() < 0.9) {
        move = findRandomMove(board);
      } else {
        if (Math.random() < 0.3) {
          move = findBlockingMove(board, playerSymbol, aiSymbol);
        }
        if (move === null) {
          move = findRandomMove(board);
        }
      }
      break;

    case 'medium':
      if (Math.random() < 0.5) {
        const strategies = [
          () => Math.random() < 0.3 ? findWinningMove(board, aiSymbol) : null,
          () => Math.random() < 0.4 ? findBlockingMove(board, playerSymbol, aiSymbol) : null,
          () => Math.random() < 0.6 ? findCenterMove(board) : null,
          () => Math.random() < 0.5 ? findCornerMove(board) : null
        ];
        for (let strategy of strategies) {
          move = strategy();
          if (move !== null) break;
        }
      }
      if (move === null) {
        move = findRandomMove(board);
      }
      break;

    case 'hard':
      // 1. Win if possible
      move = findWinningMove(board, aiSymbol);
      if (move !== null) break;

      // 2. Block if necessary
      move = findBlockingMove(board, playerSymbol, aiSymbol);
      if (move !== null) break;

      // 3. Take center if available
      if (board[4] === null) {
        move = 4;
        break;
      }

      // 4. Opposite Corner Strategy
      const corners = [0, 2, 6, 8];
      for (const corner of corners) {
        if (board[corner] === playerSymbol && board[8 - corner] === null) {
          move = 8 - corner;
          break;
        }
      }
      if (move !== null) break;
      
      // 5. Take any available corner
      move = findCornerMove(board);
      if (move !== null) break;

      // 6. Take any available side middle
      const sides = [1, 3, 5, 7].filter(i => board[i] === null);
      if (sides.length > 0) {
        move = sides[Math.floor(Math.random() * sides.length)];
        break;
      }
      
      // 7. Fallback to random move
      move = findRandomMove(board);
      break;

    case 'impossible':
      if (emptySquares.length === 9) {
        return Math.random() < 0.7 ? 4 : [0, 2, 6, 8][Math.floor(Math.random() * 4)];
      }
      let bestScore = -Infinity;
      let bestMove = null;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = aiSymbol;
          let score = minimax(board, 0, false, aiSymbol, playerSymbol);
          board[i] = null;
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      move = bestMove;
      break;

    default:
      move = findRandomMove(board);
      break;
  }

  if (move === null && emptySquares.length > 0) {
    console.warn('No move selected by AI, falling back to random move');
    move = findRandomMove(board);
  }

  return move;
};

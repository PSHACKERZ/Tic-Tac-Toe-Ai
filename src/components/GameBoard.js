import React from 'react';
import { X, Circle } from 'lucide-react';

const GameBoard = ({ 
  board, 
  winner, 
  winningLine, 
  currentPlayer, 
  playerSymbol, // Needed to disable clicks for online opponent
  onSquareClick, 
  isMobile,
  gameMode // To know if it's an online game for disabling squares
}) => {

  const renderSquare = (i) => {
    const isWinningSquare = winner && winningLine && winningLine.includes(i);
    const isDrawSquare = winner === 'draw';

    // Determine if the square should be disabled
    // Disabled if:
    // 1. There's a winner
    // 2. It's an online game AND it's not the current player's turn
    // 3. The square is already filled
    const isDisabled = 
      winner !== null || 
      (gameMode === 'online' && currentPlayer !== playerSymbol) ||
      board[i] !== null;

    return (
      <button
        key={i}
        className={`
          w-full aspect-square 
          border-4 
          rounded-xl
          flex items-center justify-center 
          text-4xl font-bold
          transition-all duration-300
          ${!isMobile && 'hover:scale-105'}
          ${board[i] === 'X' ? 'border-blue-600 text-blue-500' :
            board[i] === 'O' ? 'border-red-600 text-red-500' :
            'border-green-400 hover:border-purple-500'}
          ${isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
          ${isWinningSquare ? 'bg-green-100 animate-blink-3x' : ''}
          ${isDrawSquare ? 'animate-blink-3x' : ''}
          ${isMobile && !isDisabled ? 'active:scale-95' : ''}
          outline-none
          focus:ring-2 focus:ring-purple-500
          touch-manipulation
        `}
        onClick={() => onSquareClick(i)}
        disabled={isDisabled}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {board[i] === 'X' ? <X className="w-2/3 h-2/3" strokeWidth={3} /> : board[i] === 'O' ? <Circle className="w-2/3 h-2/3" strokeWidth={3} /> : null}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSquare(i))}
    </div>
  );
};

export default GameBoard;

import React, { useState, useEffect } from 'react';
import { X, Circle, Gamepad2, RefreshCw, Settings, Award, Trophy, Palette } from 'lucide-react';

const TicTacToe = () => {
  // State Variables
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const [aiSymbol, setAiSymbol] = useState('O');
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState('mode-select');
  const [difficulty, setDifficulty] = useState('medium');
  const [score, setScore] = useState({ 
    playerX: 0, 
    playerO: 0, 
    draws: 0 
  });
  const [winningLine, setWinningLine] = useState(null);
  const [theme, setTheme] = useState('default');

  // Theme configurations
  const themes = {
    default: {
      bgGradient: 'from-blue-100 to-purple-100',
      cardBg: 'bg-white',
      textColors: {
        playerX: 'text-blue-600',
        playerO: 'text-red-600',
        draw: 'text-gray-600',
        nextPlayer: 'text-gray-700'
      }
    },
    dark: {
      bgGradient: 'from-gray-900 to-black',
      cardBg: 'bg-gray-800',
      textColors: {
        playerX: 'text-cyan-400',
        playerO: 'text-pink-500',
        draw: 'text-gray-300',
        nextPlayer: 'text-gray-200'
      }
    },
    forest: {
      bgGradient: 'from-green-200 to-emerald-300',
      cardBg: 'bg-green-100',
      textColors: {
        playerX: 'text-green-700',
        playerO: 'text-amber-700',
        draw: 'text-gray-700',
        nextPlayer: 'text-gray-800'
      }
    }
  };

  // Cycle through themes
  const cycleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  // Winner Calculation Function
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  // AI Move Strategies
  const findWinningMove = (board, symbol, oppSymbol) => {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = symbol;
        if (calculateWinner(testBoard)?.winner === symbol) return i;
      }
    }
    return null;
  };

  const findBlockingMove = (board, symbol, oppSymbol) => {
    return findWinningMove(board, oppSymbol, symbol);
  };

  const findRandomMove = (board) => {
    const emptySquares = board.reduce((acc, square, index) => 
      square === null ? [...acc, index] : acc, []);
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  // Minimax Algorithm for Hard Difficulty
  const minimaxMove = (board, symbol) => {
    const emptySquares = board.reduce((acc, square, index) => 
      square === null ? [...acc, index] : acc, []);

    let bestScore = -Infinity;
    let bestMove = null;

    emptySquares.forEach(index => {
      const testBoard = [...board];
      testBoard[index] = symbol;
      const score = minimax(testBoard, 0, false, symbol);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = index;
      }
    });

    return bestMove;
  };

  const minimax = (board, depth, isMaximizing, symbol) => {
    const oppSymbol = symbol === 'X' ? 'O' : 'X';
    const result = calculateWinner(board);

    if (result) {
      if (result.winner === symbol) return 10 - depth;
      if (result.winner === oppSymbol) return depth - 10;
    }
    
    if (board.every(square => square !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = symbol;
          let score = minimax(board, depth + 1, false, symbol);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = oppSymbol;
          let score = minimax(board, depth + 1, true, symbol);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // AI Move Selection
  const aiMove = (boardState) => {
    const emptySquares = boardState.reduce((acc, square, index) => 
      square === null ? [...acc, index] : acc, []);

    switch(difficulty) {
      case 'easy':
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
      
      case 'medium':
        for (let strategy of [findWinningMove, findBlockingMove, findRandomMove]) {
          const move = strategy(boardState, aiSymbol, playerSymbol);
          if (move !== null) return move;
        }
        break;
      
      case 'hard':
        return minimaxMove(boardState, aiSymbol);
      
      default:
        return findRandomMove(boardState);
    }
  };

  // Score Update Function
  const updateScore = (result) => {
    setScore(prev => {
      if (result === 'X') {
        return { ...prev, playerX: prev.playerX + 1 };
      } else if (result === 'O') {
        return { ...prev, playerO: prev.playerO + 1 };
      } else if (result === 'draw') {
        return { ...prev, draws: prev.draws + 1 };
      }
      return prev;
    });
  };

  // AI Move Effect
  useEffect(() => {
    if (gameMode === 'playing' && gameMode !== 'pvp' && currentPlayer !== playerSymbol && !winner) {
      const timeout = setTimeout(() => {
        const move = aiMove(board);
        if (move !== null) {
          const boardCopy = [...board];
          boardCopy[move] = aiSymbol;
          
          const gameResult = calculateWinner(boardCopy);
          
          setBoard(boardCopy);
          setCurrentPlayer(playerSymbol);
          
          if (gameResult) {
            setWinner(gameResult.winner);
            setWinningLine(gameResult.line);
            updateScore(gameResult.winner);
          } else if (boardCopy.every(square => square !== null)) {
            setWinner('draw');
            updateScore('draw');
          }
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, board, winner, gameMode]);

  // Player Move Handler
  const handleClick = (i) => {
    if ((gameMode === 'pvai' && currentPlayer !== playerSymbol) || board[i] || winner) return;

    const boardCopy = [...board];
    boardCopy[i] = currentPlayer;
    
    const gameResult = calculateWinner(boardCopy);
    
    setBoard(boardCopy);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    
    if (gameResult) {
      setWinner(gameResult.winner);
      setWinningLine(gameResult.line);
      updateScore(gameResult.winner);
    } else if (boardCopy.every(square => square !== null)) {
      setWinner('draw');
      updateScore('draw');
    }
  };

  // Game Reset Function
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  };

  // Render Square Function
  const renderSquare = (i) => {
    const currentTheme = themes[theme];
    const isWinningSquare = winner && winningLine && winningLine.includes(i);
    const isDrawSquare = winner === 'draw';
  
    return (
      <button 
        key={i}
        className={`
          w-28 h-28 
          border-4 
          rounded-xl
          flex items-center justify-center 
          text-4xl font-bold
          transition-all duration-300
          hover:scale-105
          ${board[i] === 'X' ? 'border-blue-500 text-blue-500' : 
            'border-red-500 text-red-500'}
          ${board[i] === null ? 'border-green-600 hover:border-gray-500' : ''}
          ${winner && winner !== null ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isWinningSquare ? 'bg-green-100 animate-blink-3x' : ''}
          ${isDrawSquare ? 'animate-blink-3x' : ''}
        `}
        onClick={() => handleClick(i)}
        disabled={winner !== null}
      >
        {board[i] === 'X' ? <X size={72} strokeWidth={3} /> : board[i] === 'O' ? <Circle size={72} strokeWidth={3} /> : null}
      </button>
    );
  };
  // Mode Selection Render
  const renderModeSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-12 text-center transform transition-all hover:scale-105 hover:shadow-3xl">
        <h2 className="text-5xl font-extrabold mb-10 text-gray-800 flex items-center justify-center">
          <Gamepad2 size={56} className="mr-4 text-blue-600 animate-bounce" />
          Tic Tac Toe
        </h2>
        <div className="flex flex-col space-y-8">
          <button 
            onClick={() => setGameMode('pvp')}
            className="
              bg-gradient-to-r from-blue-500 to-blue-600 text-white 
              px-10 py-5 rounded-xl 
              text-2xl font-bold
              hover:from-blue-600 hover:to-blue-700 
              transition-all
              flex items-center justify-center
              shadow-xl hover:shadow-2xl
              group
            "
          >
            <X size={40} className="mr-4 group-hover:animate-spin" /> Player vs Player
          </button>
          <button 
            onClick={() => setGameMode('symbol-select')}
            className="
              bg-gradient-to-r from-green-500 to-green-600 text-white 
              px-10 py-5 rounded-xl 
              text-2xl font-bold
              hover:from-green-600 hover:to-green-700 
              transition-all
              flex items-center justify-center
              shadow-xl hover:shadow-2xl
              group
            "
          >
            <Settings size={40} className="mr-4 group-hover:animate-spin" /> Player vs AI
          </button>
        </div>
        
        {/* Added attribution link */}
        <div className="mt-6 text-center">
          <a 
            href="https://t.me/PSHACKERZ" 
            target="_blank" 
            rel="noopener noreferrer"
            className="
              text-xs 
              text-gray-500 
              hover:text-blue-600 
              transition-colors
              inline-block
              px-2 py-1
              bg-gray-100 
              rounded-md
            "
          >
            Made By @ P.S. Hackerz
          </a>
        </div>
      </div>
    </div>
  );

  // Symbol Selection Render
  const renderSymbolSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-12 text-center transform transition-all hover:scale-105 hover:shadow-3xl">
        <h2 className="text-5xl font-extrabold mb-10 text-gray-800 flex items-center justify-center">
          <Award size={56} className="mr-4 text-green-600 animate-pulse" />
          Choose Your Symbol
        </h2>
        <div className="flex justify-center space-x-8 mb-8">
          <button 
            onClick={() => {
              setPlayerSymbol('X');
              setAiSymbol('O');
              setGameMode('playing');
              setCurrentPlayer('X');
            }}
            className="
              flex flex-col items-center 
              bg-gradient-to-r from-blue-500 to-blue-600 text-white 
              px-10 py-8 rounded-2xl 
              hover:from-blue-600 hover:to-blue-700
              transition-all
              shadow-xl hover:shadow-2xl
              group
            "
          >
            <X size={80} strokeWidth={3} className="group-hover:animate-spin" />
            <span className="mt-4 text-xl font-bold">Play as X</span>
          </button>
          <button 
            onClick={() => {
              setPlayerSymbol('O');
              setAiSymbol('X');
              setGameMode('playing');
              setCurrentPlayer('X');
            }}
            className="
              flex flex-col items-center 
              bg-gradient-to-r from-red-500 to-red-600 text-white 
              px-10 py-8 rounded-2xl 
              hover:from-red-600 hover:to-red-700
              transition-all
              shadow-xl hover:shadow-2xl
              group
            "
          >
            <Circle size={80} strokeWidth={3} className="group-hover:animate-pulse" />
            <span className="mt-4 text-xl font-bold">Play as O</span>
          </button>
        </div>
        <div className="flex items-center justify-center space-x-6 mt-8">
          <label className="text-xl font-semibold text-gray-700 flex items-center">
            <Trophy size={32} className="mr-3 text-yellow-600" />
            AI Difficulty:
          </label>
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="
              px-6 py-3 
              border-4 border-green-300 
              rounded-xl 
              text-lg
              focus:outline-none 
              focus:ring-4 
              focus:ring-green-500
              transition-all
            "
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Imposible</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Game Board Render
  const renderGameBoard = () => {
    const currentTheme = themes[theme];

    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} p-4`}>
        <div className={`${currentTheme.cardBg} rounded-2xl shadow-2xl p-8 w-full max-w-md`}>
          <div className="flex justify-between w-full mb-6">
            <div className="text-center flex-1">
              <h3 className={`text-xl font-bold ${currentTheme.textColors.playerX}`}>Player X</h3>
              <p className="text-2xl font-extrabold">{score.playerX}</p>
            </div>
            <div className="text-center flex-1">
              <h3 className={`text-xl font-bold ${currentTheme.textColors.playerO}`}>Player O</h3>
              <p className="text-2xl font-extrabold">{score.playerO}</p>
            </div>
            <div className="text-center flex-1">
              <h3 className="text-xl font-bold text-gray-600">Draws</h3>
              <p className="text-2xl font-extrabold">{score.draws}</p>
            </div>
          </div>

          <div className="mb-6 text-center">
            {winner === 'draw' ? (
              <h2 className={`text-3xl font-bold ${currentTheme.textColors.draw}`}>
                Draw!
              </h2>
            ) : winner ? (
              <h2 className={`text-3xl font-bold ${currentTheme.textColors.playerX} animate-pulse`}>
                Winner: {winner}!
              </h2>
            ) : (
              <h2 className={`text-2xl ${currentTheme.textColors.nextPlayer}`}>
                Next Player: <span className={currentPlayer === 'X' ? currentTheme.textColors.playerX : currentTheme.textColors.playerO}>{currentPlayer}</span>
              </h2>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSquare(i))}
          </div>

          <div className="flex justify-center space-x-4">
            <button 
              onClick={resetGame}
              className="
                flex items-center
                bg-blue-500 
                text-white 
                px-6 py-3 
                rounded-lg 
                hover:bg-blue-600
                transition-colors
                shadow-md hover:shadow-lg
              "
            >
              <RefreshCw size={24} className="mr-2" /> Reset Game
            </button>
            <button 
              onClick={() => setGameMode('mode-select')}
              className="
                flex items-center
                bg-red-500 
                text-white 
                px-6 py-3 
                rounded-lg 
                hover:bg-red-600
                transition-colors
                shadow-md hover:shadow-lg
              "
            >
              <Gamepad2 size={24} className="mr-2" /> Change Mode
            </button>
            <button 
              onClick={cycleTheme}
              className="
                flex items-center
                bg-purple-500 
                text-white 
                px-6 py-3 
                rounded-lg 
                hover:bg-purple-600
                transition-colors
                shadow-md hover:shadow-lg
              "
            >
              <Palette size={24} className="mr-2" /> Theme
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  

  // Main Component Return
  return (
    <div>
      {gameMode === 'mode-select' && renderModeSelection()}
      {gameMode === 'pvp' && renderGameBoard()}
      {gameMode === 'symbol-select' && renderSymbolSelection()}
      {gameMode === 'playing' && renderGameBoard()}
    </div>
  );
};

export default TicTacToe;
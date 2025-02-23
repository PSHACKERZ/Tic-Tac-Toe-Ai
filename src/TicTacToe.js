import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  X, 
  Circle, 
  Gamepad2, 
  RefreshCw, 
  Bot, 
  Award, 
  Trophy, 
  Palette, 
  Globe, 
  Copy, 
  Music, 
  Volume2, 
  Settings, 
  ArrowLeft 
} from 'lucide-react';
import { Howl } from 'howler';
import { supabase } from './lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

// Add this CSS at the top of your component
const styles = `
  .gsi-material-button {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -webkit-appearance: none;
    background-color: WHITE;
    background-image: none;
    border: 1px solid #747775;
    -webkit-border-radius: 20px;
    border-radius: 20px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #1f1f1f;
    cursor: pointer;
    font-family: 'Roboto', arial, sans-serif;
    font-size: 14px;
    height: 40px;
    letter-spacing: 0.25px;
    outline: none;
    overflow: hidden;
    padding: 0 12px;
    position: relative;
    text-align: center;
    -webkit-transition: background-color .218s, border-color .218s, box-shadow .218s;
    transition: background-color .218s, border-color .218s, box-shadow .218s;
    vertical-align: middle;
    white-space: nowrap;
    width: auto;
    max-width: 400px;
    min-width: min-content;
  }

  .gsi-material-button .gsi-material-button-icon {
    height: 20px;
    margin-right: 12px;
    min-width: 20px;
    width: 20px;
  }

  .gsi-material-button .gsi-material-button-content-wrapper {
    -webkit-align-items: center;
    align-items: center;
    display: flex;
    -webkit-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: nowrap;
    flex-wrap: nowrap;
    height: 100%;
    justify-content: space-between;
    position: relative;
    width: 100%;
  }

  .gsi-material-button .gsi-material-button-contents {
    -webkit-flex-grow: 1;
    flex-grow: 1;
    font-family: 'Roboto', arial, sans-serif;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
  }

  .gsi-material-button .gsi-material-button-state {
    -webkit-transition: opacity .218s;
    transition: opacity .218s;
    bottom: 0;
    left: 0;
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .gsi-material-button:disabled {
    cursor: default;
    background-color: #ffffff61;
    border-color: #1f1f1f1f;
  }

  .gsi-material-button:disabled .gsi-material-button-contents {
    opacity: 38%;
  }

  .gsi-material-button:disabled .gsi-material-button-icon {
    opacity: 38%;
  }

  .gsi-material-button:not(:disabled):active .gsi-material-button-state,
  .gsi-material-button:not(:disabled):focus .gsi-material-button-state {
    background-color: #303030;
    opacity: 12%;
  }

  .gsi-material-button:not(:disabled):hover {
    -webkit-box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
  }

  .gsi-material-button:not(:disabled):hover .gsi-material-button-state {
    background-color: #303030;
    opacity: 8%;
  }
`;

const TicTacToe = () => {
  // Add the styles to the document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

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
  const [roomCode, setRoomCode] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(() => {
    const userAgent = window.navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || window.innerWidth <= 768;
  });
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [showDisconnectMessage, setShowDisconnectMessage] = useState(false);
  const [isBgMusicOn, setIsBgMusicOn] = useState(true);
  const [isSoundEffectsOn, setSoundEffectsOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [gameTag, setGameTag] = useState('');
  const [showGameTagModal, setShowGameTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [gameTagError, setGameTagError] = useState('');
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    winningLine: null,
    gameStatus: 'waiting',
    hasGameStarted: false,
    lastUpdate: null
  });
  const [soundsInitialized, setSoundsInitialized] = useState(false);

  const sounds = useMemo(() => {
    if (!soundsInitialized) return {};

    const soundInstances = {
      win: new Howl({ 
        src: ['sounds/win.mp3'],
        volume: 0.5,
        html5: true,
        preload: true,
        onloaderror: (id, err) => console.error('Error loading win sound:', err)
      }),
      click: new Howl({ 
        src: ['sounds/click.mp3'],
        volume: 0.3,
        html5: true,
        preload: true,
        onloaderror: (id, err) => console.error('Error loading click sound:', err)
      }),
      gameBg: new Howl({ 
        src: ['sounds/game-bg.mp3'],
        loop: true, 
        volume: 0.3,
        html5: true,
        preload: true,
        onloaderror: (id, err) => console.error('Error loading game background music:', err)
      }),
      lose: new Howl({ 
        src: ['sounds/lose.mp3'],
        volume: 0.5,
        html5: true,
        preload: true,
        onloaderror: (id, err) => console.error('Error loading lose sound:', err)
      }),
      menuBg: new Howl({ 
        src: ['sounds/menu-bg.mp3'],
        loop: true, 
        volume: 0.3,
        html5: true,
        preload: true,
        onloaderror: (id, err) => console.error('Error loading menu background music:', err)
      }),
      placeO: new Howl({ 
        src: ['sounds/place-o.mp3'],
        volume: 0.4,
        html5: true,
        preload: true,
        onloaderror: (id, err) => console.error('Error loading place O sound:', err)
      }),
      placeX: new Howl({ 
        src: ['sounds/place-x.mp3'],
        volume: 0.4,
        html5: true,
        preload: true,
        onloaderror: (id, err) => console.error('Error loading place X sound:', err)
      })
    };

    // Add load event listeners and error handling
    Object.entries(soundInstances).forEach(([name, sound]) => {
      sound.on('load', () => console.log(`Sound loaded: ${name}`));
      sound.on('loaderror', (id, err) => {
        console.error(`Error loading ${name}:`, err);
        // Set a flag to indicate this sound failed to load
        sound._loadFailed = true;
      });
    });

    return soundInstances;
  }, [soundsInitialized]);

  // Update the playSound function with better error handling and initialization check
  const playSound = useCallback((soundName) => {
    if (!soundsInitialized || !isSoundEffectsOn || !sounds[soundName]) {
      return;
    }

    try {
      const sound = sounds[soundName];
      
      // Skip if sound failed to load
      if (sound._loadFailed) {
        console.log(`Skipping failed sound: ${soundName}`);
        return;
      }

      // For background music, handle differently
      if (soundName === 'menuBg' || soundName === 'gameBg') {
        if (!sound.playing()) {
          sound.fade(0, 0.3, 500);
          sound.play();
        }
      } else {
        // For effect sounds, stop and play
        sound.stop();
        sound.play();
      }
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
      // Mark sound as failed if there's a playback error
      if (sounds[soundName]) {
        sounds[soundName]._loadFailed = true;
      }
    }
  }, [isSoundEffectsOn, sounds, soundsInitialized]);

  // Initialize sounds on first user interaction
  const initializeSounds = useCallback(() => {
    if (!soundsInitialized) {
      setSoundsInitialized(true);
    }
  }, [soundsInitialized]);

  // Add click handler to initialize sounds
  const handleInteraction = useCallback((handler) => {
    return (e) => {
      initializeSounds();
      if (handler) {
        handler(e);
      }
    };
  }, [initializeSounds]);

  // Update the handleClick function to use handleInteraction
  const handleClick = (index) => {
    if (gameMode === 'online') {
      handleOnlineMove(index);
      return;
    }

    if ((gameMode === 'playing' && currentPlayer !== playerSymbol) || board[index] || winner) return;

    const boardCopy = [...board];
    boardCopy[index] = currentPlayer;
    
    // Play piece placement sound
    if (currentPlayer === 'X') {
      playSound('placeX');
    } else {
      playSound('placeO');
    }

    const gameResult = calculateWinner(boardCopy);
    
    setBoard(boardCopy);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    
    if (gameResult) {
      setWinner(gameResult.winner);
      setWinningLine(gameResult.line);
      updateScore(gameResult.winner);
      
      if (gameMode === 'playing') {
        if (gameResult.winner === playerSymbol) {
          playSound('win');
        } else if (gameResult.winner === aiSymbol) {
          playSound('lose');
        }
      } else if (gameMode === 'pvp') {
        playSound('win');
      }
    } else if (boardCopy.every(square => square !== null)) {
      setWinner('draw');
      updateScore('draw');
    }
  };

  // Theme configurations
  const themes = {
    default: {
      bgGradient: 'from-indigo-200 via-purple-100 to-pink-200',
      cardBg: 'bg-white',
      menuBg: 'from-indigo-300 via-purple-200 to-pink-300',
      textColors: {
        playerX: 'text-blue-600',
        playerO: 'text-red-600',
        draw: 'text-gray-600',
        nextPlayer: 'text-gray-700'
      }
    },
    dark: {
      bgGradient: 'from-slate-900 via-purple-900 to-slate-900',
      cardBg: 'bg-gray-800',
      menuBg: 'from-slate-800 via-purple-800 to-slate-800',
      textColors: {
        playerX: 'text-blue-400',
        playerO: 'text-red-400',
        draw: 'text-gray-300',
        nextPlayer: 'text-gray-200',
        primary: 'text-gray-100',
        secondary: 'text-gray-400',
        accent: 'text-purple-400'
      }
    },
    sunset: {
      bgGradient: 'from-orange-300 via-rose-300 to-purple-300',
      cardBg: 'bg-gradient-to-br from-white to-orange-50',
      menuBg: 'from-orange-400 via-rose-400 to-purple-400',
      textColors: {
        playerX: 'text-blue-600',
        playerO: 'text-red-600',
        draw: 'text-gray-600',
        nextPlayer: 'text-gray-700'
      }
    },
    ocean: {
      bgGradient: 'from-cyan-300 via-blue-300 to-indigo-400',
      cardBg: 'bg-gradient-to-br from-white to-blue-50',
      menuBg: 'from-cyan-400 via-blue-400 to-indigo-500',
      textColors: {
        playerX: 'text-blue-600',
        playerO: 'text-red-600',
        draw: 'text-gray-600',
        nextPlayer: 'text-gray-700'
      }
    },
    forest: {
      bgGradient: 'from-emerald-300 via-teal-300 to-cyan-300',
      cardBg: 'bg-gradient-to-br from-white to-emerald-50',
      menuBg: 'from-emerald-400 via-teal-400 to-cyan-400',
      textColors: {
        playerX: 'text-blue-600',
        playerO: 'text-red-600',
        draw: 'text-gray-600',
        nextPlayer: 'text-gray-700'
      }
    },
    galaxy: {
      bgGradient: 'from-violet-400 via-purple-400 to-fuchsia-400',
      cardBg: 'bg-gradient-to-br from-white to-violet-50',
      menuBg: 'from-violet-500 via-purple-500 to-fuchsia-500',
      textColors: {
        playerX: 'text-blue-600',
        playerO: 'text-red-600',
        draw: 'text-gray-600',
        nextPlayer: 'text-gray-700'
      }
    },
    candy: {
      bgGradient: 'from-pink-300 via-rose-300 to-red-300',
      cardBg: 'bg-gradient-to-br from-white to-pink-50',
      menuBg: 'from-pink-400 via-rose-400 to-red-400',
      textColors: {
        playerX: 'text-blue-600',
        playerO: 'text-red-600',
        draw: 'text-gray-600',
        nextPlayer: 'text-gray-700'
      }
    },
    autumn: {
      bgGradient: 'from-amber-300 via-orange-300 to-red-300',
      cardBg: 'bg-gradient-to-br from-white to-amber-50',
      menuBg: 'from-amber-400 via-orange-400 to-red-400',
      textColors: {
        playerX: 'text-blue-600',
        playerO: 'text-red-600',
        draw: 'text-gray-600',
        nextPlayer: 'text-gray-700'
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
  const findWinningMove = useCallback((board, symbol, oppSymbol) => {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = symbol;
        if (calculateWinner(testBoard)?.winner === symbol) return i;
      }
    }
    return null;
  }, []);

  const findBlockingMove = useCallback((board, symbol, oppSymbol) => {
    return findWinningMove(board, oppSymbol, symbol);
  }, [findWinningMove]);

  const findRandomMove = (board) => {
    const emptySquares = board.reduce((acc, square, index) => 
      square === null ? [...acc, index] : acc, []);
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  // Minimax Algorithm for Hard Difficulty
  const minimax = useCallback((board, depth, isMaximizing, symbol) => {
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
  }, []);

  // AI Move Selection
  const aiMove = useCallback((board, currentDifficulty) => {
    playSound('click');

    const emptySquares = board.reduce((acc, square, index) => 
      square === null ? [...acc, index] : acc, []);

    let move = null;
    
    // Ensure difficulty is valid and set
    const validDifficulty = ['easy', 'medium', 'impossible'].includes(currentDifficulty) 
      ? currentDifficulty 
      : 'medium';

    switch (validDifficulty) {
      case 'easy':
        // Easy: 90% random moves, 10% smart moves
        if (Math.random() < 0.9) {
          move = findRandomMove(board);
        } else {
          // Only block winning moves sometimes
          if (Math.random() < 0.3) {
            move = findBlockingMove(board, aiSymbol, playerSymbol);
          }
          if (move === null) {
            move = findRandomMove(board);
          }
        }
        break;

      case 'medium':
        // Medium: More balanced mix of strategies
        if (Math.random() < 0.5) { // 50% chance of making a strategic move
          // Try strategies in order of priority
          const strategies = [
            // 30% chance to find winning move
            () => Math.random() < 0.3 ? findWinningMove(board, aiSymbol, playerSymbol) : null,
            // 40% chance to block opponent
            () => Math.random() < 0.4 ? findBlockingMove(board, aiSymbol, playerSymbol) : null,
            // 60% chance to take center
            () => Math.random() < 0.6 ? findCenterMove(board) : null,
            // 50% chance to take corner
            () => Math.random() < 0.5 ? findCornerMove(board) : null
          ];

          for (let strategy of strategies) {
            move = strategy();
            if (move !== null) break;
          }
        }
        
        // If no strategic move was made, make a random move
        if (move === null) {
          move = findRandomMove(board);
        }
        break;

      case 'impossible':
        // First move optimization for faster gameplay
        if (emptySquares.length === 9) {
          // First move: Take center or corner
          return Math.random() < 0.7 ? 4 : [0, 2, 6, 8][Math.floor(Math.random() * 4)];
        }
        
        // Use full minimax for perfect play
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < board.length; i++) {
          if (board[i] === null) {
            board[i] = aiSymbol;
            let score = minimax(board, 0, false, aiSymbol);
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
        // Fallback to medium difficulty
        move = findRandomMove(board);
        break;
    }

    if (move === null) {
      // Fallback to random move if no move was selected
      console.warn('No move selected, falling back to random move');
      move = findRandomMove(board);
    }

    return move;
  }, [
    playSound, 
    aiSymbol, 
    playerSymbol, 
    findBlockingMove, 
    findWinningMove, 
    minimax // Add missing dependencies
  ]);

  // Add helper functions for medium difficulty
  const findCenterMove = (board) => {
    return board[4] === null ? 4 : null;
  };

  const findCornerMove = (board) => {
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => board[i] === null);
    return availableCorners.length > 0 ? 
      availableCorners[Math.floor(Math.random() * availableCorners.length)] : 
      null;
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
    if (gameMode === 'playing' && currentPlayer !== playerSymbol && !winner) {
      const timer = setTimeout(() => {
        const move = aiMove(board, difficulty);
        if (move !== null) {
          const newBoard = [...board];
          newBoard[move] = aiSymbol;
          setBoard(newBoard);
          
          if (aiSymbol === 'X') {
            playSound('placeX');
          } else {
            playSound('placeO');
          }

          const result = calculateWinner(newBoard);
          if (result) {
            setWinner(aiSymbol);
            playSound('lose');
          } else if (newBoard.every(square => square !== null)) {
            setWinner('draw');
          } else {
            setCurrentPlayer(playerSymbol);
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    gameMode, 
    currentPlayer, 
    playerSymbol, 
    winner, 
    board, 
    difficulty, 
    aiSymbol, 
    aiMove, 
    playSound
  ]);

  // Game Reset Function
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  };

  // Update the handleResetClick function
  const handleResetClick = () => {
    // Always reset the game first for immediate feedback
    resetGame();
    playSound('click');

    // Then try to show an ad if we're in Android
    if (window.Android) {
      try {
        window.Android.showRewardedAd();
      } catch (error) {
        console.log('Error showing ad:', error);
      }
    }
  };

  // Update the callback to only handle successful ad completions
  window.onRewardEarned = (success) => {
    if (success) {
      // Maybe give some bonus or special effect for watching the ad
      playSound('win');
    }
  };

  // Render Square Function
  const renderSquare = (i, isOnline = false) => {
    const isWinningSquare = winner && winningLine && winningLine.includes(i);
    const isDrawSquare = winner === 'draw';
  
    const handleSquareClick = () => {
      if (isOnline) {
        handleOnlineMove(i);
      } else {
        handleClick(i);
      }
    };
  
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
          ${winner && winner !== null ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isWinningSquare ? 'bg-green-100 animate-blink-3x' : ''}
          ${isDrawSquare ? 'animate-blink-3x' : ''}
          ${isMobile ? 'active:scale-95' : ''}
          outline-none
          focus:ring-2 focus:ring-purple-500
          touch-manipulation
        `}
        onClick={handleMobileClick(handleInteraction(handleSquareClick))}
        disabled={winner !== null || (isOnline && currentPlayer !== playerSymbol)}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {board[i] === 'X' ? <X className="w-2/3 h-2/3" strokeWidth={3} /> : board[i] === 'O' ? <Circle className="w-2/3 h-2/3" strokeWidth={3} /> : null}
      </button>
    );
  };

  // Mode Selection Render
  const renderModeSelection = () => {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${themes[theme].menuBg} p-4`}>
        <div className={`${themes[theme].cardBg} shadow-2xl rounded-3xl p-6 sm:p-12 text-center w-full max-w-md`}>
          <h1 className={`
            text-4xl sm:text-5xl font-bold mb-8 
            ${theme === 'dark' ? 'text-white' : 'text-gray-800'}
          `}>
            Tic Tac Toe
          </h1>

          {/* Game Tag Display */}
          {session?.user && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Game Tag:</p>
                <p className="text-gray-700 font-medium">
                  {gameTag || 'Not set'}
                </p>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setShowGameTagModal(true);
                }}
                className="
                  px-4 py-2
                  bg-gradient-to-r from-green-500 to-green-600
                  text-white rounded-lg 
                  hover:from-green-600 hover:to-green-700 
                  transition-colors
                  text-sm font-medium
                "
              >
                {gameTag ? 'Change Tag' : 'Set Tag'}
              </button>
            </div>
          )}

          {/* Game Mode Buttons */}
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleInteraction(() => {
                playSound('click');
                setGameMode('pvp');
              })}
              className={`
                bg-gradient-to-r from-blue-500 to-blue-600
                text-white px-6 py-4 rounded-xl 
                text-lg font-bold
                ${!isMobile && 'hover:from-blue-600 hover:to-blue-700 transition-all'}
                flex items-center justify-center
                shadow-xl hover:shadow-2xl
                group
              `}
            >
              <Users className="w-6 h-6 mr-3" />
              Local Multiplayer
            </button>

            <button
              onClick={handleInteraction(() => {
                playSound('click');
                setGameMode('symbol-select');
              })}
              className={`
                bg-gradient-to-r from-purple-500 to-purple-600
                text-white px-6 py-4 rounded-xl 
                text-lg font-bold
                ${!isMobile && 'hover:from-purple-600 hover:to-purple-700 transition-all'}
                flex items-center justify-center
                shadow-xl hover:shadow-2xl
                group
              `}
            >
              <Bot className="w-6 h-6 mr-3" />
              Play vs AI
            </button>

            <button
              onClick={handleInteraction(() => {
                playSound('click');
                if (!session) {
                  setShowAuth(true);
                } else {
                  setGameMode('online-menu');
                }
              })}
              className={`
                bg-gradient-to-r from-green-500 to-green-600
                text-white px-6 py-4 rounded-xl 
                text-lg font-bold
                ${!isMobile && 'hover:from-green-600 hover:to-green-700 transition-all'}
                flex items-center justify-center
                shadow-xl hover:shadow-2xl
                group
              `}
            >
              <Globe className="w-6 h-6 mr-3" />
              Play Online
            </button>
          </div>

          {/* Settings Button */}
          <button
            onClick={handleInteraction(() => {
              playSound('click');
              setShowSettings(true);
            })}
            className={`
              mt-8 w-full
              bg-gradient-to-r from-gray-500 to-gray-600
              text-white px-6 py-4 rounded-xl 
              text-lg font-bold
              ${!isMobile && 'hover:from-gray-600 hover:to-gray-700 transition-all'}
              flex items-center justify-center
              shadow-xl hover:shadow-2xl
              group
            `}
          >
            <Settings className="w-6 h-6 mr-3" />
            Settings
          </button>

          {/* Footer with contact link */}
          <div className="mt-8 text-center">
            <a
              href="https://t.me/PS_Hacker"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-block
                text-xs
                text-blue-700
                px-2 py-1
                bg-gray-50 
                rounded-md
                transition-colors 
                duration-300
                hover:text-red-700
                hover:bg-gray-200
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:ring-blue-700
              "
              title="Contact P.S. Hackerz via Telegram"
              aria-label="Contact P.S. Hackerz via Telegram"
            >
              Made By @ P.S. Hackerz (Contact us)
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Symbol Selection Render
  const renderSymbolSelection = () => {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${themes[theme].menuBg} p-4`}>
        <div className={`${themes[theme].cardBg} shadow-2xl rounded-3xl p-6 sm:p-12 text-center w-full max-w-md`}>
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 sm:mb-10 text-gray-800 flex items-center justify-center">
            <Award className="mr-2 sm:mr-4 text-green-600 animate-pulse w-10 h-10 sm:w-14 sm:h-14" />
            Choose Your Symbol
          </h2>
          <div className="flex justify-center space-x-4 sm:space-x-8 mb-6 sm:mb-8">
            <button 
              onClick={() => {
                playSound('click');
                setPlayerSymbol('X');
                setAiSymbol('O');
                setGameMode('playing');
                setCurrentPlayer('X');
              }}
              className={`
                flex flex-col items-center 
                bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                px-4 py-6 sm:px-10 sm:py-8 rounded-2xl 
                hover:from-blue-600 hover:to-blue-700
                transition-all
                shadow-xl hover:shadow-2xl
                group
                w-full max-w-[150px]
              `}
            >
              <X className="w-12 h-12 sm:w-20 sm:h-20 group-hover:animate-spin" strokeWidth={3} />
              <span className="mt-2 sm:mt-4 text-base sm:text-xl font-bold">Play as X</span>
            </button>
            <button 
              onClick={() => {
                playSound('click');
                setPlayerSymbol('O');
                setAiSymbol('X');
                setGameMode('playing');
                setCurrentPlayer('X');
              }}
              className={`
                flex flex-col items-center 
                bg-gradient-to-r from-red-500 to-red-600 text-white 
                px-4 py-6 sm:px-10 sm:py-8 rounded-2xl 
                hover:from-red-600 hover:to-red-700
                transition-all
                shadow-xl hover:shadow-2xl
                group
                w-full max-w-[150px]
              `}
            >
              <Circle className="w-12 h-12 sm:w-20 sm:h-20 group-hover:animate-pulse" strokeWidth={3} />
              <span className="mt-2 sm:mt-4 text-base sm:text-xl font-bold">Play as O</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-6 sm:mt-8">
            <label className="text-base sm:text-xl font-semibold text-gray-700 flex items-center">
              <Trophy className="mr-2 sm:mr-3 w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              AI Difficulty:
            </label>
            <select 
              value={difficulty}
              onChange={(e) => {
                const newDifficulty = e.target.value;
                if (['easy', 'medium', 'impossible'].includes(newDifficulty)) {
                  setDifficulty(newDifficulty);
                } else {
                  console.warn(`Invalid difficulty selected: ${newDifficulty}`);
                  setDifficulty('medium');
                }
              }}
              className="
                px-4 py-2 sm:px-6 sm:py-3 
                border-4 border-green-300 
                rounded-xl 
                text-base sm:text-lg
                focus:outline-none 
                focus:ring-4 
                focus:ring-green-500
                transition-all
                w-full max-w-[200px]
              "
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="impossible">Impossible</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Game Board Render
  const renderGameBoard = () => {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${themes[theme].bgGradient} p-4`}>
        <div className={`${themes[theme].cardBg} shadow-2xl rounded-3xl p-6 sm:p-12 w-full max-w-md`}>
          {/* Add back button for online mode */}
          {gameMode === 'online' && (
            <div className="mb-4">
              <button 
                onClick={() => {
                  playSound('click');
                  setShowLeaveConfirmation(true);
                }}
                className={`
                  flex items-center bg-red-500 text-white 
                  px-3 py-2 rounded-lg 
                  hover:bg-red-600 transition-colors
                `}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Leave Game
              </button>
            </div>
          )}

          {/* Score display */}
          <div className="flex justify-between w-full mb-4 sm:mb-6">
            <div className="text-center flex-1">
              <h3 className={`text-base sm:text-xl font-bold ${themes[theme].textColors.playerX}`}>Player X</h3>
              <p className="text-xl sm:text-2xl font-extrabold">{score.playerX}</p>
            </div>
            <div className="text-center flex-1">
              <h3 className={`text-base sm:text-xl font-bold ${themes[theme].textColors.playerO}`}>Player O</h3>
              <p className="text-xl sm:text-2xl font-extrabold">{score.playerO}</p>
            </div>
            <div className="text-center flex-1">
              <h3 className="text-base sm:text-xl font-bold text-gray-600">Draws</h3>
              <p className="text-xl sm:text-2xl font-extrabold">{score.draws}</p>
            </div>
          </div>

          {/* Add Difficulty Display for AI mode */}
          {gameMode === 'playing' && (
            <div className="mb-4 text-center">
              <span className={`
                px-3 py-1 
                rounded-full text-sm font-medium
                ${difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}
              `}>
                {difficulty === 'easy' ? 'Easy' :
                 difficulty === 'medium' ? 'Medium' :
                 'Impossible'} Mode
              </span>
            </div>
          )}

          {/* Game status */}
          <div className="mb-4 sm:mb-6 text-center">
            {winner === 'draw' ? (
              <h2 className={`text-2xl sm:text-3xl font-bold ${themes[theme].textColors.draw}`}>
                Draw!
              </h2>
            ) : winner ? (
              <h2 className={`text-2xl sm:text-3xl font-bold ${themes[theme].textColors.playerX} ${!isMobile && 'animate-pulse'}`}>
                Winner: {winner}!
              </h2>
            ) : (
              <div className="space-y-2">
                <h2 className={`text-xl sm:text-2xl ${themes[theme].textColors.nextPlayer}`}>
                  {gameMode === 'playing' ? (
                    // AI Game Mode
                    currentPlayer === aiSymbol ? (
                      <span className={themes[theme].textColors.playerO}>AI's Turn</span>
                    ) : (
                      <span className={themes[theme].textColors.playerX}>Your Turn</span>
                    )
                  ) : gameMode === 'online' ? (
                    // Online Game Mode
                    currentPlayer === playerSymbol ? (
                      <span className={currentPlayer === 'X' ? themes[theme].textColors.playerX : themes[theme].textColors.playerO}>
                        Your Turn ({gameTag || 'You'})
                      </span>
                    ) : (
                      <span className={currentPlayer === 'X' ? themes[theme].textColors.playerX : themes[theme].textColors.playerO}>
                        Opponent's Turn
                      </span>
                    )
                  ) : (
                    // Local PvP Mode
                    <span className={currentPlayer === 'X' ? themes[theme].textColors.playerX : themes[theme].textColors.playerO}>
                      Player {currentPlayer}'s Turn
                    </span>
                  )}
                </h2>
              </div>
            )}
          </div>

          {/* Game board */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSquare(i, gameMode === 'online'))}
          </div>

          {/* Game Controls */}
          {gameMode === 'online' ? (
            // Online mode controls
            <>
              {/* Chat System */}
              <div className="mt-4">
                <div className="bg-white rounded-lg shadow-inner p-4 h-48 overflow-y-auto mb-4">
                  <div className="flex flex-col space-y-2 mb-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`
                          flex flex-col
                          ${msg.player_symbol === playerSymbol ? 'items-end' : 'items-start'}
                        `}
                      >
                        <div className={`
                          px-3 py-2 rounded-lg max-w-[80%]
                          ${msg.player_symbol === playerSymbol ? 
                            'bg-blue-500 text-white' : 
                            'bg-gray-200 text-gray-800'
                          }
                        `}>
                          <p className={`
                            text-xs mb-1 font-medium
                            ${msg.player_symbol === playerSymbol ? 
                              'text-blue-100' : 
                              'text-gray-600'
                            }
                          `}>
                            {msg.game_tag || 'Anonymous'}
                          </p>
                          <p>{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="
                      px-4 py-2 bg-blue-500 text-white rounded-lg
                      hover:bg-blue-600 transition-colors
                      disabled:bg-gray-300
                    "
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* New Game Button - Show only when game has ended */}
              {winner && (
                <div className="mt-4 flex justify-center">
                  <button 
                    onClick={() => {
                      playSound('click');
                      window.location.reload(); // This will refresh the page
                    }}
                    className={`
                      bg-green-500 text-white px-6 py-2 rounded-lg
                      flex items-center gap-2
                      ${!isMobile && 'hover:bg-green-600 transition-colors'}
                    `}
                  >
                    <RefreshCw className="w-5 h-5" />
                    New Game
                  </button>
                </div>
              )}
            </>
          ) : (
            // Local mode controls
            <div className="mt-4 flex justify-center space-x-2 sm:space-x-4">
              <button 
                onClick={handleResetClick}
                className={`
                  flex items-center bg-indigo-500 text-white 
                  px-3 py-2 sm:px-6 sm:py-3 rounded-lg 
                  ${!isMobile && 'hover:bg-indigo-600 transition-colors'}
                `}
              >
                <RefreshCw className={`mr-1 sm:mr-2 w-4 h-4 sm:w-6 sm:h-6 ${!isMobile && 'group-hover:animate-spin'}`} /> Reset
              </button>
              <button 
                onClick={() => {
                  playSound('click');
                  setGameMode('mode-select');
                }}
                className={`
                  flex items-center bg-violet-500 text-white 
                  px-3 py-2 sm:px-6 sm:py-3 rounded-lg 
                  ${!isMobile && 'hover:bg-violet-600 transition-colors'}
                `}
              >
                <Gamepad2 className={`mr-1 sm:mr-2 w-4 h-4 sm:w-6 sm:h-6 ${!isMobile && 'group-hover:animate-spin'}`} /> Mode
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Update background music handling
  useEffect(() => {
    if (!soundsInitialized || !isBgMusicOn) {
      return;
    }

    const handleBgMusic = () => {
      if (!sounds.menuBg || !sounds.gameBg) return;

      try {
        // Stop both sounds first to ensure no overlap
        sounds.menuBg.stop();
        sounds.gameBg.stop();

        // Only play if background music is enabled
        if (isBgMusicOn) {
          if (gameMode === 'playing' || gameMode === 'pvp') {
            // In game - play game background music
            sounds.gameBg.volume(0.3);
            sounds.gameBg.play();
          } else {
            // In menu - play menu background music
            sounds.menuBg.volume(0.3);
            sounds.menuBg.play();
          }
        }
      } catch (error) {
        console.error('Error handling background music:', error);
      }
    };

    // Add a small delay to ensure sounds are loaded
    const timer = setTimeout(handleBgMusic, 100);

    return () => {
      clearTimeout(timer);
      try {
        // Stop both sounds on cleanup
        if (sounds.gameBg) sounds.gameBg.stop();
        if (sounds.menuBg) sounds.menuBg.stop();
      } catch (error) {
        console.error('Error cleaning up background music:', error);
      }
    };
  }, [gameMode, sounds, isBgMusicOn, soundsInitialized]);

  // Add cleanup for sounds when component unmounts
  useEffect(() => {
    return () => {
      if (soundsInitialized) {
        try {
          Object.values(sounds).forEach(sound => {
            if (sound.playing()) {
              sound.fade(sound.volume(), 0, 200);
              setTimeout(() => {
                sound.stop();
                sound.unload();
              }, 200);
            }
          });
        } catch (error) {
          console.error('Error cleaning up sounds:', error);
        }
      }
    };
  }, [sounds, soundsInitialized]);
  
  const renderOnlineMenu = () => {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${themes[theme].menuBg} p-4`}>
        <div className={`${themes[theme].cardBg} shadow-2xl rounded-3xl p-6 sm:p-12 text-center w-full max-w-md`}>
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text flex items-center justify-center gap-3">
              <Globe className="w-10 h-10 text-indigo-500 animate-spin-slow" />
              Online Play
            </h2>
            {session?.user && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-inner">
                <p className="text-sm text-gray-500">Logged in as:</p>
                <p className="text-gray-700 font-medium truncate" title={session.user.email}>
                  {session.user.email}
                </p>
              </div>
            )}
          </div>

          {/* Create Room Section */}
          <div className="mb-8">
            <button 
              onClick={() => {
                playSound('click');
                createGameRoom();
              }}
              className="
                w-full
                bg-gradient-to-r from-violet-500 to-purple-600 
                text-white px-6 py-4 rounded-xl 
                text-xl font-bold
                hover:from-violet-600 hover:to-purple-700 
                transition-all duration-300
                transform hover:scale-105
                flex items-center justify-center
                shadow-xl hover:shadow-2xl
                group
              "
            >
              <Trophy className="w-8 h-8 mr-3 group-hover:animate-bounce" />
              Create New Room
            </button>
          </div>

          {/* Join Room Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl shadow-inner mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Join Existing Room</h3>
            <div className="relative mb-4">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter Room Code"
                className="
                  w-full px-4 py-3
                  border-2 border-gray-300 
                  rounded-xl text-lg
                  focus:outline-none 
                  focus:border-blue-500
                  transition-colors
                  bg-white
                  placeholder-gray-400
                "
                maxLength={6}
              />
              {roomCode && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomCode);
                    playSound('click');
                  }}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-500 hover:text-blue-600
                    transition-colors
                    p-2 hover:bg-blue-50 rounded-lg
                  "
                  title="Copy Room Code"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>
            <button 
              onClick={() => {
                playSound('click');
                joinGameRoom(roomCode);
              }}
              disabled={!roomCode}
              className={`
                w-full
                bg-gradient-to-r from-blue-500 to-indigo-600
                text-white px-6 py-4 rounded-xl 
                text-xl font-bold
                transition-all duration-300
                flex items-center justify-center
                shadow-xl hover:shadow-2xl
                transform hover:scale-105
                group
                ${!roomCode ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-indigo-700'}
              `}
            >
              <Users className="w-8 h-8 mr-3 group-hover:animate-pulse" />
              Join Room
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-600 font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Back Button */}
          <button 
            onClick={() => {
              playSound('click');
              leaveOnlineGame();
            }}
            className="
              w-full
              bg-gradient-to-r from-gray-500 to-gray-600
              text-white px-4 py-3 rounded-xl 
              text-lg font-bold
              hover:from-gray-600 hover:to-gray-700 
              transition-all duration-300
              flex items-center justify-center
              shadow-lg hover:shadow-xl
              transform hover:scale-105
              group
            "
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Menu
          </button>
        </div>
      </div>
    );
  };

  // Add function to subscribe to chat messages
  const subscribeToMessages = useCallback((roomCode) => {
    try {
      const messageChannel = supabase.channel(`messages:${roomCode}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_messages',
            filter: `room_id=eq.${roomCode}`
          },
          (payload) => {
            if (payload.new) {
              setMessages(prev => [...prev, payload.new]);
              // Play sound for new message if it's not from current user
              if (payload.new.sender !== session?.user?.id) {
                playSound('click');
              }
            }
          }
        )
        .subscribe();

      return messageChannel;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return null;
    }
  }, [session, playSound]);

  // Add function to send messages
  const sendMessage = async () => {
    if (!newMessage.trim() || !session?.user) return;
    
    try {
      const { error } = await supabase
        .from('game_messages')
        .insert([{
          room_id: roomCode,
          sender: session.user.id,
          message: newMessage.trim(),
          player_symbol: playerSymbol,
          game_tag: gameTag || 'Anonymous'
        }]);

      if (error) throw error;
      setNewMessage('');
      playSound('click');
    } catch (error) {
      console.error('Error sending message:', error);
      handleError(error, 'Failed to send message');
    }
  };

  // Add function to load existing messages
  const loadExistingMessages = async (roomCode) => {
    try {
      const { data, error } = await supabase
        .from('game_messages')
        .select('*')
        .eq('room_id', roomCode)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Update joinGameRoom to include message subscription
  const joinGameRoom = async (roomCode) => {
    if (!session?.user) {
      setShowAuth(true);
      return;
    }

    try {
      // First, check if the room exists and is waiting
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_id', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .maybeSingle();

      if (roomError) throw roomError;
      if (!room) throw new Error('Room not found or is not available');

      // Then update the room with player O in a transaction
      const { data: updatedRoom, error: updateError } = await supabase
        .from('game_rooms')
        .update({
          player_o: session.user.id,
          status: 'playing',
          updated_at: new Date().toISOString()
        })
        .eq('room_id', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      if (!updatedRoom) throw new Error('Failed to join room');

      // Set local game state
      setRoomCode(roomCode.toUpperCase());
      setPlayerSymbol('O');
      setGameMode('online');
      setGameStatus('playing');
      setBoard(room.board || Array(9).fill(null));
      setCurrentPlayer(room.current_player || 'X');
      setHasGameStarted(true);
      
      // Subscribe to room updates and messages
      subscribeToRoom(roomCode.toUpperCase());
      subscribeToMessages(roomCode.toUpperCase());
      await loadExistingMessages(roomCode.toUpperCase());

    } catch (error) {
      console.error('Join room error:', error);
      handleError(error, 'Failed to join room. Please check the room code and try again.');
    }
  };

  // Update createGameRoom to include message subscription
  const createGameRoom = async () => {
    if (!session?.user) {
      setShowAuth(true);
      return;
    }

    try {
      const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: newRoom, error } = await supabase
        .from('game_rooms')
        .insert([{
          room_id: newRoomCode,
          board: Array(9).fill(null),
          current_player: 'X',
          player_x: session.user.id,
          status: 'waiting',
          winner: null,
          winning_line: null
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!newRoom) throw new Error('Failed to create room');

      setRoomCode(newRoomCode);
      setPlayerSymbol('X');
      setGameMode('online');
      setGameStatus('waiting');
      setBoard(Array(9).fill(null));
      setCurrentPlayer('X');
      setHasGameStarted(false);
      
      // Subscribe to room updates and messages
      subscribeToRoom(newRoomCode);
      subscribeToMessages(newRoomCode);
    } catch (error) {
      console.error('Error creating room:', error);
      handleError(error, 'Failed to create room. Please try again.');
    }
  };

  // Add cleanup for messages when game ends
  useEffect(() => {
    if (gameStatus === 'ended') {
      setMessages([]);
    }
  }, [gameStatus]);

  // Add useEffect to initialize playerId when component mounts
  useEffect(() => {
    if (!playerId) {
      const newPlayerId = Math.random().toString(36).substring(2, 9);
      setPlayerId(newPlayerId);
      console.log('Generated player ID:', newPlayerId);
    }
  }, [playerId]);

  // Add a window resize listener to update isMobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add this to subscribeToRoom
  useEffect(() => {
    if (gameMode === 'online' && roomCode && session?.user) {
      let disconnectTimer;
      let reconnectAttempts = 0;
      const MAX_RECONNECT_ATTEMPTS = 3;
      
      const presence = supabase.channel(`presence:${roomCode}`)
        .on('presence', { event: 'sync' }, () => {
          const state = presence.presenceState();
          const playerCount = Object.keys(state).length;
          
          if (playerCount < 2 && hasGameStarted) {
            if (disconnectTimer) clearTimeout(disconnectTimer);
            disconnectTimer = setTimeout(async () => {
              setShowDisconnectMessage(true);
              
              // Try to reconnect a few times before showing disconnect message
              if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                try {
                  await presence.unsubscribe();
                  await presence.subscribe();
                } catch (error) {
                  console.error('Reconnection attempt failed:', error);
                }
              }
            }, 5000);
          } else {
            setShowDisconnectMessage(false);
            if (disconnectTimer) clearTimeout(disconnectTimer);
            reconnectAttempts = 0;
          }
        })
        .on('presence', { event: 'join' }, () => {
          // Reset reconnection attempts when someone joins
          reconnectAttempts = 0;
          setShowDisconnectMessage(false);
        })
        .on('presence', { event: 'leave' }, () => {
          // Start disconnect timer when someone leaves
          if (hasGameStarted) {
            if (disconnectTimer) clearTimeout(disconnectTimer);
            disconnectTimer = setTimeout(() => setShowDisconnectMessage(true), 5000);
          }
        })
        .subscribe(async () => {
          try {
            await presence.track({ 
              user_id: session.user.id,
              player_symbol: playerSymbol,
              online_at: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error tracking presence:', error);
          }
        });

      return () => {
        if (disconnectTimer) clearTimeout(disconnectTimer);
        presence.untrack().catch(console.error);
        supabase.removeChannel(presence);
      };
    }
  }, [gameMode, roomCode, hasGameStarted, session, playerSymbol]);

  // Add touch event handling for mobile
  useEffect(() => {
    if (isMobile) {
      // Prevent double-tap zoom
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });

      // Prevent pinch zoom
      document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });

      // Add meta viewport tag to prevent zooming
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewportMeta);

      // Add touch-action CSS
      const style = document.createElement('style');
      style.textContent = `
        * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        button {
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }
      `;
      document.head.appendChild(style);

      // Handle window resize
      const handleResize = () => {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
          setIsMobile(newIsMobile);
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      // Handle keyboard on mobile
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          // Add a slight delay to ensure the keyboard is fully shown
          setTimeout(() => {
            window.scrollTo(0, input.offsetTop - 20);
          }, 300);
        });
      });

      return () => {
        // Clean up
        document.removeEventListener('touchstart', (e) => {
          if (e.touches.length > 1) e.preventDefault();
        });
        document.removeEventListener('touchmove', (e) => {
          if (e.touches.length > 1) e.preventDefault();
        });
        document.head.removeChild(viewportMeta);
        document.head.removeChild(style);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        inputs.forEach(input => {
          input.removeEventListener('focus', () => {});
        });
      };
    }
  }, [isMobile]);

  // Add mobile-specific click handling
  const handleMobileClick = useCallback((handler) => {
    return (e) => {
      if (isMobile) {
        // Prevent ghost clicks
        e.preventDefault();
        e.stopPropagation();
        
        // Add active state feedback
        const target = e.currentTarget;
        target.style.opacity = '0.7';
        setTimeout(() => {
          target.style.opacity = '1';
        }, 150);
      }
      handler(e);
    };
  }, [isMobile]);

  // Add better error messages
  const handleError = useCallback((error, message) => {
    console.error('Error:', error);
    setErrorMessage(message || 'An unexpected error occurred');
    playSound('click');
  }, [playSound]);

  // Reset hasGameStarted when leaving game or starting new game
  const handleLeaveGame = useCallback(async () => {
    try {
      playSound('click');
      
      const { error } = await supabase
        .from('game_rooms')
        .update({
          status: 'ended',
          winner: playerSymbol === 'X' ? 'O' : 'X'
        })
        .eq('room_id', roomCode);

      if (error) throw error;
      
      setGameMode('mode-select');
      setErrorMessage('');
      setRoomCode('');
      setBoard(Array(9).fill(null));
      setWinner(null);
      setCurrentPlayer('X');
      setWinningLine(null);
      setMessages([]);
      setGameStatus('waiting');
      setScore({ playerX: 0, playerO: 0, draws: 0 });
      setHasGameStarted(false);
      
      Object.values(sounds).forEach(sound => {
        sound.stop();
      });

      setShowDisconnectMessage(false);

    } catch (error) {
      console.error('Error leaving game:', error);
      handleError(error, 'Failed to leave game. Please try again.');
    }
  }, [playSound, playerSymbol, roomCode, sounds]);

  // Add Settings Menu component
  const renderSettings = () => {
    const isDarkTheme = theme === 'dark';
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br ${themes[theme].bgGradient} flex items-center justify-center p-4">
        {showGameTagModal && renderGameTagModal()}
        
        <div className={`${themes[theme].cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>Settings</h2>

          {/* User Profile Section */}
          {session?.user && (
            <div className={`mb-6 p-4 ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="flex justify-between items-center mb-2">
                <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>Logged in as:</p>
                <button
                  onClick={() => {
                    playSound('click');
                    signOut();
                  }}
                  className="
                    px-4 py-2
                    bg-gradient-to-r from-red-500 to-red-600
                    text-white rounded-lg 
                    hover:from-red-600 hover:to-red-700 
                    transition-colors
                    text-sm font-medium
                  "
                >
                  Sign Out
                </button>
              </div>
              <p className={`${isDarkTheme ? 'text-gray-200' : 'text-gray-700'} font-medium truncate mb-4`} 
                 title={session.user.email}>
                {session.user.email}
              </p>
              
              {/* Game Tag section */}
              <div className="pt-3 border-t border-gray-600 flex justify-between items-center">
                <div>
                  <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>Game Tag:</p>
                  <p className={`${isDarkTheme ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                    {gameTag || 'Not set'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    setShowGameTagModal(true);
                  }}
                  className="
                    px-4 py-2
                    bg-gradient-to-r from-green-500 to-green-600
                    text-white rounded-lg 
                    hover:from-green-600 hover:to-green-700 
                    transition-colors
                    text-sm font-medium
                  "
                >
                  {gameTag ? 'Change Tag' : 'Set Tag'}
                </button>
              </div>
            </div>
          )}

          {/* Sound Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-lg ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>Background Music</span>
              <button 
                onClick={() => {
                  playSound('click');
                  setIsBgMusicOn(prev => !prev);
                  // If turning music on, play appropriate background music
                  if (!isBgMusicOn) {
                    if (gameMode === 'playing' || gameMode === 'pvp') {
                      sounds.gameBg.play();
                    } else {
                      sounds.menuBg.play();
                    }
                  }
                }}
                className={`
                  flex items-center justify-center
                  px-4 py-2 rounded-lg
                  ${isBgMusicOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                  text-white transition-colors
                `}
              >
                <Music className={`w-5 h-5 mr-2 ${!isBgMusicOn && 'opacity-50'}`} />
                {isBgMusicOn ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-lg ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>Sound Effects</span>
              <button 
                onClick={() => {
                  if (isSoundEffectsOn) playSound('click');
                  setSoundEffectsOn(!isSoundEffectsOn);
                }}
                className={`
                  flex items-center justify-center
                  px-4 py-2 rounded-lg
                  ${isSoundEffectsOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                  text-white transition-colors
                `}
              >
                <Volume2 className={`w-5 h-5 mr-2 ${!isSoundEffectsOn && 'opacity-50'}`} />
                {isSoundEffectsOn ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="flex items-center justify-between mt-4">
            <span className={`text-lg ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>Theme</span>
            <button 
              onClick={() => {
                playSound('click');
                cycleTheme();
              }}
              className={`
                flex items-center justify-center
                px-4 py-2 rounded-lg
                bg-gradient-to-r from-purple-500 to-indigo-500 
                hover:from-purple-600 hover:to-indigo-600
                text-white transition-colors
              `}
            >
              <Palette className="w-5 h-5 mr-2" />
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          </div>

          {/* Back Button */}
          <button 
            onClick={() => {
              playSound('click');
              setShowSettings(false);
            }}
            className={`
              w-full mt-6
              bg-gradient-to-r from-slate-500 to-slate-600
              text-white px-4 py-3 rounded-xl 
              text-lg font-bold
              ${!isMobile && 'hover:from-slate-600 hover:to-slate-700 transition-all'}
              flex items-center justify-center
              shadow-xl hover:shadow-2xl
              group
            `}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Menu
          </button>
        </div>
      </div>
    );
  };

  // Add the Auth UI modal component
  const renderAuthModal = () => {
    const isDarkTheme = theme === 'dark';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`
          ${themes[theme].cardBg} 
          rounded-xl shadow-2xl 
          p-6 max-w-md w-full 
          max-h-[90vh] overflow-y-auto
          border-4 border-blue-400
          bg-gradient-to-br from-white to-blue-50
        `}>
          {/* Header with game-like styling */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <Gamepad2 className="w-8 h-8 text-blue-500 animate-pulse" />
              <h2 className={`
                text-2xl font-bold 
                bg-gradient-to-r from-blue-600 to-purple-600 
                text-transparent bg-clip-text
              `}>
                Player Login
              </h2>
            </div>
            <button
              onClick={() => {
                playSound('click');
                setShowAuth(false);
              }}
              className="
                p-2 rounded-full 
                hover:bg-red-100 
                transition-colors
                group
              "
            >
              <X className="w-6 h-6 text-red-500 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* Welcome message with game theme */}
          <div className="mb-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Join the Game!
            </h3>
            <p className={`
              text-gray-600 
              px-6 py-3 
              rounded-lg 
              bg-blue-50 
              border-2 border-blue-100
            `}>
              Sign in to play online matches, save your stats, and compete with players worldwide!
            </p>
          </div>

          {/* Custom Google Sign In Button */}
          <div className="flex justify-center">
            <button 
              onClick={() => {
                playSound('click');
                supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: 'https://fkasbkmcoumsezziolzo.supabase.co/auth/v1/callback'
                  }
                });
              }}
              className="gsi-material-button w-[300px] h-[50px] mb-6 transform hover:scale-105 transition-transform"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '24px', height: '24px' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents text-base">Sign in with Google</span>
                <span style={{ display: 'none' }}>Sign in with Google</span>
              </div>
            </button>
          </div>

          {/* Footer with game theme */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to play fair and have fun! 🎮
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Add a function to handle game cleanup
  const cleanupGame = useCallback(async () => {
    try {
      // Update room status
      if (roomCode && session?.user) {
        await supabase
          .from('game_rooms')
          .update({
            status: 'ended',
            winner: playerSymbol === 'X' ? 'O' : 'X',
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomCode)
          .eq(playerSymbol === 'X' ? 'player_x' : 'player_o', session.user.id);
      }

      // Clean up all channels
      const channels = [
        `room:${roomCode}`,
        `messages:${roomCode}`,
        `presence:${roomCode}`
      ].map(channel => supabase.channel(channel));

      await Promise.all(channels.map(channel => supabase.removeChannel(channel)));

      // Reset all game state
      setGameMode('mode-select');
      setErrorMessage('');
      setRoomCode('');
      setBoard(Array(9).fill(null));
      setWinner(null);
      setCurrentPlayer('X');
      setWinningLine(null);
      setMessages([]);
      setGameStatus('waiting');
      setScore({ playerX: 0, playerO: 0, draws: 0 });
      setHasGameStarted(false);
      
      Object.values(sounds).forEach(sound => {
        sound.stop();
      });

      setShowDisconnectMessage(false);

    } catch (error) {
      console.error('Error cleaning up game:', error);
    }
  }, [roomCode, session, playerSymbol, sounds]);

  // Update the leaveOnlineGame function
  const leaveOnlineGame = async () => {
    try {
      await cleanupGame();
    } catch (error) {
      console.error('Error leaving game:', error);
      handleError(error, 'Failed to leave game properly');
    }
  };

  // Update the auth state change effect to prevent auto-redirect
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        console.log('User is logged in:', session.user);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        console.log('Auth state changed:', session.user);
        setShowAuth(false); // Close the auth modal when user logs in
        // Remove auto-redirect
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Add a signOut function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      leaveOnlineGame();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Add the confirmation dialog component
  const renderLeaveConfirmation = () => {
    return showLeaveConfirmation && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${themes[theme].cardBg} rounded-xl shadow-2xl p-6 max-w-sm w-full text-center`}>
          <h3 className="text-xl font-bold mb-4">Leave Game?</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to leave the game? Your opponent will win by forfeit.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                playSound('click');
                setShowLeaveConfirmation(false);
              }}
              className="
                flex-1 px-4 py-3
                bg-gray-500 text-white rounded-lg 
                hover:bg-gray-600 transition-colors
                font-medium
              "
            >
              Cancel
            </button>
            <button
              onClick={() => {
                playSound('click');
                handleLeaveGame();
                setShowLeaveConfirmation(false);
              }}
              className="
                flex-1 px-4 py-3
                bg-red-500 text-white rounded-lg 
                hover:bg-red-600 transition-colors
                font-medium
              "
            >
              Leave Game
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add function to handle game tag update
  const updateGameTag = async (newTag) => {
    try {
      // Reset error state
      setGameTagError('');

      // Check if tag is already in use
      const { data: existingTag, error: checkError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('game_tag', newTag)
        .not('user_id', 'eq', session.user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingTag) {
        setGameTagError('This game tag is already in use. Please choose another.');
        playSound('click');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: session.user.id,
          game_tag: newTag
        });

      if (error) throw error;
      
      setGameTag(newTag);
      setShowGameTagModal(false);
      playSound('click');
    } catch (error) {
      console.error('Error updating game tag:', error);
      setGameTagError('Failed to update game tag. Please try again.');
    }
  };

  // Add effect to fetch game tag on session change
  useEffect(() => {
    const fetchGameTag = async () => {
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('game_tag')
            .eq('user_id', session.user.id)
            .single();

          if (error) throw error;
          if (data) setGameTag(data.game_tag);
        } catch (error) {
          console.error('Error fetching game tag:', error);
        }
      }
    };

    fetchGameTag();
  }, [session]);

  // Add the game tag modal component
  const renderGameTagModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
          <h3 className="text-xl font-bold mb-4">
            {gameTag ? 'Change Game Tag' : 'Set Game Tag'}
          </h3>
          <p className="text-gray-600 mb-4">
            This tag will be shown in game chats.
          </p>
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => {
              setNewTagInput(e.target.value);
              setGameTagError(''); // Clear error when user types
            }}
            placeholder="Enter your game tag"
            maxLength={15}
            className="
              w-full px-4 py-2
              border-2 border-gray-300 
              rounded-lg text-lg
              focus:outline-none 
              focus:border-blue-500
              transition-colors
              mb-2
            "
          />
          {/* Error message display */}
          {gameTagError && (
            <p className="text-red-500 text-sm mb-4 animate-bounce">
              {gameTagError}
            </p>
          )}
          <div className="flex space-x-4">
            <button
              onClick={() => {
                playSound('click');
                setShowGameTagModal(false);
                setNewTagInput(''); // Reset input on cancel
                setGameTagError(''); // Clear any errors
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (newTagInput.trim()) {
                  updateGameTag(newTagInput.trim());
                }
              }}
              disabled={!newTagInput.trim() || !!gameTagError}
              className="
                flex-1 px-4 py-2 
                bg-blue-500 text-white rounded-lg 
                hover:bg-blue-600 transition-colors
                disabled:bg-gray-300
                disabled:cursor-not-allowed
              "
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add a function to handle game end
  const handleGameEnd = useCallback((winner) => {
    if (winner === 'draw') {
      playSound('click');
      setScore(prev => ({
        ...prev,
        draws: prev.draws + 1
      }));
    } else if (winner === playerSymbol) {
      playSound('win');
      setScore(prev => ({
        ...prev,
        [playerSymbol === 'X' ? 'playerX' : 'playerO']: prev[playerSymbol === 'X' ? 'playerX' : 'playerO'] + 1
      }));
    } else {
      playSound('lose');
      setScore(prev => ({
        ...prev,
        [playerSymbol === 'X' ? 'playerO' : 'playerX']: prev[playerSymbol === 'X' ? 'playerO' : 'playerX'] + 1
      }));
    }
  }, [playerSymbol, playSound]);

  // Function to handle moves in online game
  const handleOnlineMove = async (index) => {
    if (board[index] || currentPlayer !== playerSymbol || winner) return;

    try {
      // Optimistic update
      const newBoard = [...board];
      newBoard[index] = playerSymbol;
      setBoard(newBoard);
      
      // Play sound immediately for better UX
      playSound(playerSymbol === 'X' ? 'placeX' : 'placeO');

      // Check for winner
      const result = calculateWinner(newBoard);
      const isDraw = !result && newBoard.every(square => square !== null);

      // Get latest game state from server
      const { data: currentGame, error: fetchError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_id', roomCode)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!currentGame) throw new Error('Room not found');

      // Verify move is still valid
      if (currentGame.board[index] || currentGame.winner || currentGame.status === 'ended') {
        // Revert optimistic update if move is invalid
        setBoard(currentGame.board);
        return;
      }

      // Update game state
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({
          board: newBoard,
          current_player: playerSymbol === 'X' ? 'O' : 'X',
          winner: result ? playerSymbol : isDraw ? 'draw' : null,
          status: (result || isDraw) ? 'finished' : 'playing',
          winning_line: result ? result.line : null,
          updated_at: new Date().toISOString()
        })
        .eq('room_id', roomCode);

      if (updateError) throw updateError;

      // Play appropriate sound for game end
      if (result) {
        // The player who made the winning move
        playSound('win');
      } else if (isDraw) {
        playSound('click');
      }
    } catch (error) {
      console.error('Error making move:', error);
      handleError(error, 'Failed to make move. Please try again.');
      
      // Revert optimistic update on error
      const { data } = await supabase
        .from('game_rooms')
        .select('board')
        .eq('room_id', roomCode)
        .maybeSingle();
        
      if (data) {
        setBoard(data.board);
      }
    }
  };

  // Update the subscribeToRoom function to handle win/lose sounds
  const subscribeToRoom = (roomCode) => {
    try {
      // Subscribe to room changes
      const roomChannel = supabase.channel(`room:${roomCode}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_rooms',
            filter: `room_id=eq.${roomCode}`
          },
          async (payload) => {
            if (payload.new) {
              const newState = payload.new;
              
              // Update game state atomically to prevent race conditions
              setGameState(prev => {
                // Skip update if it's older than our current state
                if (prev.lastUpdate && new Date(newState.updated_at) < new Date(prev.lastUpdate)) {
                  return prev;
                }

                // Handle win/lose sounds for the non-moving player
                if (newState.winner && newState.winner !== 'draw' && newState.winner !== prev.winner) {
                  // If this player is not the winner, play lose sound
                  if (newState.winner !== playerSymbol) {
                    playSound('lose');
                  }
                }

                return {
                  board: newState.board || Array(9).fill(null),
                  currentPlayer: newState.current_player || 'X',
                  winner: newState.winner,
                  winningLine: newState.winning_line,
                  gameStatus: newState.status,
                  hasGameStarted: newState.status === 'playing',
                  lastUpdate: newState.updated_at
                };
              });

              // Handle game end
              if (newState.winner) {
                handleGameEnd(newState.winner);
              }
            }
          }
        )
        .subscribe();

      return roomChannel;
    } catch (error) {
      console.error('Error subscribing to room:', error);
      return null;
    }
  };

  // Update the board and other game states when gameState changes
  useEffect(() => {
    setBoard(gameState.board);
    setCurrentPlayer(gameState.currentPlayer);
    setWinner(gameState.winner);
    setWinningLine(gameState.winningLine);
    setGameStatus(gameState.gameStatus);
    setHasGameStarted(gameState.hasGameStarted);
  }, [gameState]);

  // Main Component Return
  return (
    <div>
      {showSettings ? renderSettings() : (
        <>
          {showAuth && renderAuthModal()}
          {showLeaveConfirmation && renderLeaveConfirmation()}
          {showGameTagModal && renderGameTagModal()}
          {gameMode === 'mode-select' && renderModeSelection()}
          {gameMode === 'online-menu' && renderOnlineMenu()}
          {gameMode === 'online' && (
            <div>
              {/* Display room code and waiting message if waiting for player */}
              {gameStatus === 'waiting' && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-xl shadow-lg z-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <p className="text-lg font-bold">Room Code: {roomCode}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomCode);
                        playSound('click');
                      }}
                      className="
                        p-1.5
                        text-gray-500 hover:text-green-600
                        transition-colors
                        rounded-lg
                        hover:bg-gray-100
                      "
                      title="Copy Room Code"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600">Waiting for opponent to join...</p>
                </div>
              )}
              {renderGameBoard()}
            </div>
          )}
          {gameMode === 'pvp' && renderGameBoard()}
          {gameMode === 'symbol-select' && renderSymbolSelection()}
          {gameMode === 'playing' && renderGameBoard()}
          {hasGameStarted && showDisconnectMessage && gameMode === 'online' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 p-4 rounded-xl shadow-lg z-10">
              <p className="text-red-600 mb-3">Opponent disconnected</p>
              <button
                onClick={() => {
                  playSound('click');
                  window.location.reload(); // This will refresh the page
                }}
                className={`
                  bg-green-500 text-white px-4 py-2 rounded-lg
                  flex items-center justify-center gap-2 w-full
                  ${!isMobile && 'hover:bg-green-600 transition-colors'}
                `}
              >
                <RefreshCw className="w-4 h-4" />
                New Game
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TicTacToe;
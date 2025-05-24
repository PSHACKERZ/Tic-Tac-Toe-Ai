import { calculateWinner, findWinningMove, findBlockingMove, findRandomMove } from './AILogic';

describe('AILogic', () => {
  describe('calculateWinner', () => {
    // Test cases for 'X' winning
    const xWinningScenarios = [
      { board: ['X', 'X', 'X', null, null, null, null, null, null], line: [0, 1, 2] }, // Row 1
      { board: [null, null, null, 'X', 'X', 'X', null, null, null], line: [3, 4, 5] }, // Row 2
      { board: [null, null, null, null, null, null, 'X', 'X', 'X'], line: [6, 7, 8] }, // Row 3
      { board: ['X', null, null, 'X', null, null, 'X', null, null], line: [0, 3, 6] }, // Col 1
      { board: [null, 'X', null, null, 'X', null, null, 'X', null], line: [1, 4, 7] }, // Col 2
      { board: [null, null, 'X', null, null, 'X', null, null, 'X'], line: [2, 5, 8] }, // Col 3
      { board: ['X', null, null, null, 'X', null, null, null, 'X'], line: [0, 4, 8] }, // Diag 1
      { board: [null, null, 'X', null, 'X', null, 'X', null, null], line: [2, 4, 6] }, // Diag 2
    ];

    xWinningScenarios.forEach(scenario => {
      test(`should declare 'X' as winner with line [${scenario.line.join(',')}]`, () => {
        expect(calculateWinner(scenario.board)).toEqual({ winner: 'X', line: scenario.line });
      });
    });

    // Test cases for 'O' winning
    const oWinningScenarios = [
      { board: ['O', 'O', 'O', null, null, null, null, null, null], line: [0, 1, 2] },
      { board: [null, null, null, 'O', 'O', 'O', null, null, null], line: [3, 4, 5] },
      { board: [null, null, null, null, null, null, 'O', 'O', 'O'], line: [6, 7, 8] },
      { board: ['O', null, null, 'O', null, null, 'O', null, null], line: [0, 3, 6] },
      { board: [null, 'O', null, null, 'O', null, null, 'O', null], line: [1, 4, 7] },
      { board: [null, null, 'O', null, null, 'O', null, null, 'O'], line: [2, 5, 8] },
      { board: ['O', null, null, null, 'O', null, null, null, 'O'], line: [0, 4, 8] },
      { board: [null, null, 'O', null, 'O', null, 'O', null, null], line: [2, 4, 6] },
    ];

    oWinningScenarios.forEach(scenario => {
      test(`should declare 'O' as winner with line [${scenario.line.join(',')}]`, () => {
        expect(calculateWinner(scenario.board)).toEqual({ winner: 'O', line: scenario.line });
      });
    });

    test('should declare a draw game', () => {
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      expect(calculateWinner(board)).toBeNull(); // Or handle draw explicitly if function changes
    });
    
    test('should return null for an empty board', () => {
      const board = Array(9).fill(null);
      expect(calculateWinner(board)).toBeNull();
    });

    test('should return null for an ongoing game (partially filled, no winner)', () => {
      const board = ['X', 'O', 'X', null, 'O', null, 'X', null, null];
      expect(calculateWinner(board)).toBeNull();
    });
  });

  describe('findWinningMove', () => {
    test('should return winning index for X', () => {
      // X X _
      // O O _
      // _ _ _
      const board = ['X', 'X', null, 'O', 'O', null, null, null, null];
      expect(findWinningMove(board, 'X')).toBe(2);
    });

    test('should return winning index for O', () => {
      // X X _
      // O O _
      // _ _ X
      const board = ['X', 'X', null, 'O', 'O', null, null, null, 'X'];
      expect(findWinningMove(board, 'O')).toBe(5);
    });

    test('should return null if no winning move for X', () => {
      // X O X
      // O X O
      // O _ O (X cannot win by placing at 7)
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', null, 'O'];
      expect(findWinningMove(board, 'X')).toBeNull();
    });

    test('should return null if no winning move for O on a full board', () => {
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      expect(findWinningMove(board, 'O')).toBeNull();
    });

    test('should return null for an empty board', () => {
      const board = Array(9).fill(null);
      expect(findWinningMove(board, 'X')).toBeNull();
    });

    test('should return first available winning move for X', () => {
        // X X _ (win at 2)
        // O _ O
        // X X _ (also win at 8)
        const board = ['X', 'X', null, 'O', null, 'O', 'X', 'X', null];
        expect(findWinningMove(board, 'X')).toBe(2); // or 8, depending on iteration order
    });
  });

  describe('findBlockingMove', () => {
    test('should return blocking index for X when O is about to win', () => {
      // O O _ (X should block at 2)
      // X _ _
      // X _ _
      const board = ['O', 'O', null, 'X', null, null, 'X', null, null];
      expect(findBlockingMove(board, 'O', 'X')).toBe(2); // 'O' is playerSymbol, 'X' is aiSymbol (the one blocking)
    });

    test('should return blocking index for O when X is about to win', () => {
      // X X _ (O should block at 2)
      // _ O _
      // _ _ O
      const board = ['X', 'X', null, null, 'O', null, null, null, 'O'];
      expect(findBlockingMove(board, 'X', 'O')).toBe(2); // 'X' is playerSymbol, 'O' is aiSymbol (the one blocking)
    });

    test('should return null if no blocking move is needed', () => {
      // X O X
      // _ _ _
      // O _ O
      const board = ['X', 'O', 'X', null, null, null, 'O', null, 'O'];
      expect(findBlockingMove(board, 'X', 'O')).toBeNull();
    });

    test('should return null for an empty board', () => {
      const board = Array(9).fill(null);
      expect(findBlockingMove(board, 'X', 'O')).toBeNull();
    });

     test('should return first available blocking move for X', () => {
        // O O _ (block at 2)
        // X _ X
        // O O _ (also block at 8 for O)
        const board = ['O', 'O', null, 'X', null, 'X', 'O', 'O', null];
        // Player is 'O', AI is 'X'. AI needs to block 'O'.
        expect(findBlockingMove(board, 'O', 'X')).toBe(2); 
    });
  });

  describe('findRandomMove', () => {
    test('should return a valid empty square index from a partially filled board', () => {
      const board = ['X', 'O', null, 'X', null, 'O', null, null, null];
      const emptyIndices = [2, 4, 6, 7, 8];
      const move = findRandomMove(board);
      expect(emptyIndices).toContain(move);
    });

    test('should return the only available empty square index', () => {
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', null];
      expect(findRandomMove(board)).toBe(8);
    });

    test('should return one of the available empty square indices on an empty board', () => {
      const board = Array(9).fill(null);
      const move = findRandomMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThanOrEqual(8);
      expect(board[move]).toBeNull();
    });

    test('should return undefined if board is full (no empty squares)', () => {
      // The function's current behavior for a full board is to return undefined
      // because emptySquares will be an empty array, and Math.floor(Math.random() * 0) is NaN,
      // leading to undefined when indexing an empty array.
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
      expect(findRandomMove(board)).toBeUndefined();
    });
  });
});

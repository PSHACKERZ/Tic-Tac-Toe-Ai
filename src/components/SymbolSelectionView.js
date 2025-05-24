import React from 'react';
import { X, Circle, Award, Trophy } from 'lucide-react';

const SymbolSelectionView = ({
  themes,
  theme,
  difficulty,
  onDifficultyChange,
  onSymbolSelect,
  playSound,
}) => {
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
              onSymbolSelect('X', 'O');
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
              onSymbolSelect('O', 'X');
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
                onDifficultyChange(newDifficulty);
              } else {
                console.warn(`Invalid difficulty selected: ${newDifficulty}`);
                onDifficultyChange('medium'); // Fallback to medium
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
              <option value="hard">Hard</option>
            <option value="impossible">Impossible</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SymbolSelectionView;

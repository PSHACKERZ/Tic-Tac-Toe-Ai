import React from 'react';
import { Users, Bot, Globe, Settings } from 'lucide-react';

const ModeSelectionView = ({
  themes,
  theme,
  session,
  gameTag,
  onSetGameMode,
  onShowAuth,
  onShowSettings,
  onShowGameTagModal,
  playSound,
  isMobile,
  handleInteraction,
}) => {
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
                onShowGameTagModal(true);
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
              onSetGameMode('pvp');
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
              onSetGameMode('symbol-select');
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
                onShowAuth(true);
              } else {
                onSetGameMode('online-menu');
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
            onShowSettings(true);
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
            href="https://t.me/PS_Hackerz"
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

export default ModeSelectionView;

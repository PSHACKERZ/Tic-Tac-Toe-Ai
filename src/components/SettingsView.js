import React from 'react';
import { Music, Volume2, Palette, ArrowLeft } from 'lucide-react';

const SettingsView = ({
  themes,
  theme,
  onCycleTheme,
  session,
  gameTag,
  onShowGameTagModal,
  onSignOut,
  isBgMusicOn,
  onToggleBgMusic,
  isSoundEffectsOn,
  onToggleSoundEffects,
  onClose,
  playSound,
  // isMobile, // Not directly used in this component's JSX from the original renderSettings
  sounds, // Pass Howl instances for direct control if needed by onToggleBgMusic
}) => {
  const isDarkTheme = theme === 'dark';

  const handleToggleBgMusic = () => {
    playSound('click');
    const newIsBgMusicOn = !isBgMusicOn;
    onToggleBgMusic(newIsBgMusicOn); // Update state in TicTacToe.js

    // Directly control music playback
    if (newIsBgMusicOn) {
      // Logic to determine which bg music to play might be complex here
      // Assuming menuBg as a default or that TicTacToe.js handles which one to play
      if (sounds.menuBg && !sounds.menuBg.playing()) {
        sounds.menuBg.play();
      } else if (sounds.gameBg && !sounds.gameBg.playing()) {
        // This case might need more context from gameMode, which isn't passed here
        // For now, let's assume TicTacToe.js handles starting the correct music
        // when isBgMusicOn becomes true via its own useEffect.
      }
    } else {
      if (sounds.menuBg && sounds.menuBg.playing()) sounds.menuBg.stop();
      if (sounds.gameBg && sounds.gameBg.playing()) sounds.gameBg.stop();
    }
  };

  const handleToggleSoundEffects = () => {
    if (isSoundEffectsOn) playSound('click'); // Play click only if effects were on
    onToggleSoundEffects(!isSoundEffectsOn);
     if (!isSoundEffectsOn && !isSoundEffectsOn) playSound('click'); // Play click if effects are now on
  };


  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${themes[theme].bgGradient} flex items-center justify-center p-4 z-50`}>
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
                  onSignOut();
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
          </div>
        )}

        {/* Sound Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-lg ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>Background Music</span>
            <button
              onClick={handleToggleBgMusic}
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
              onClick={handleToggleSoundEffects}
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
              onCycleTheme();
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
            onClose();
          }}
          className={`
            w-full mt-6
            bg-gradient-to-r from-slate-500 to-slate-600
            text-white px-4 py-3 rounded-xl 
            text-lg font-bold
            hover:from-slate-600 hover:to-slate-700 transition-all /* Removed isMobile condition for hover */
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

export default SettingsView;

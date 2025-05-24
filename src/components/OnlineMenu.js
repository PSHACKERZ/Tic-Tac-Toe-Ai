import React from 'react';
import { Globe, Trophy, Users, Copy, ArrowLeft } from 'lucide-react';

const OnlineMenu = ({
  themes,
  theme,
  session,
  roomCode,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
  onLeaveOnlineGame,
  errorMessage,
  playSound,
}) => {
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
              onCreateRoom();
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
              onChange={(e) => onRoomCodeChange(e.target.value.toUpperCase())}
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
              onJoinRoom(roomCode);
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
            onLeaveOnlineGame(); // This should navigate back to mode-select
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

export default OnlineMenu;

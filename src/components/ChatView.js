import React from 'react';

const ChatView = ({
  messages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  playerSymbol,
  // gameTag, // gameTag of the current player, to display "You" or their tag
}) => {
  return (
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
                  {/* Display current player's gameTag if message is from them, otherwise sender's game_tag */}
                  {msg.player_symbol === playerSymbol ? (msg.game_tag || 'You') : (msg.game_tag || 'Anonymous')}
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
          onChange={(e) => onNewMessageChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && newMessage.trim() && onSendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { if (newMessage.trim()) onSendMessage(); }}
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
  );
};

export default ChatView;

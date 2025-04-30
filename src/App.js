import { useState, useEffect } from 'react';

export default function OneTapAwayApp() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('oneTapAwayMessages');
    return saved ? JSON.parse(saved) : [
      { key: '1', text: 'Please bring milk' },
      { key: '2', text: 'Need diaper change help' },
      { key: '3', text: 'Come right now!' },
      { key: '4', text: 'Baby is sleeping, please be quiet' },
      { key: '5', text: 'Could you bring a drink?' },
      { key: '6', text: 'Need your help' },
      { key: '7', text: 'Please call me' },
      { key: '8', text: 'Check the shopping list' },
      { key: '9', text: 'Baby is crying, help needed' }
    ];
  });
  
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('discordWebhookUrl') || '';
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState('');

  // Save settings
  useEffect(() => {
    localStorage.setItem('oneTapAwayMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('discordWebhookUrl', webhookUrl);
  }, [webhookUrl]);

  // Send notification
  const sendNotification = async (message) => {
    if (!webhookUrl) {
      setNotification({
        type: 'error',
        message: 'Discord Webhook URL is not set'
      });
      return;
    }

    try {
      // Use Webhook instead of Discord DM
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message
        }),
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: 'Notification sent'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to send notification'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Error: ${error.message}`
      });
    }

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Edit message text
  const editMessage = (key) => {
    const message = messages.find(m => m.key === key);
    setIsEditing(key);
    setEditText(message.text);
  };

  // Save edit
  const saveEdit = () => {
    setMessages(messages.map(m => 
      m.key === isEditing ? { ...m, text: editText } : m
    ));
    setIsEditing(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">One Tap Away</h1>
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isSettingsOpen ? 'Back' : 'Settings'}
        </button>
      </header>

      {/* Notification display */}
      {notification && (
        <div className={`p-3 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white text-center`}>
          {notification.message}
        </div>
      )}

      {/* Main screen */}
      {!isSettingsOpen ? (
        <div className="flex-grow grid grid-cols-3 gap-4 p-4">
          {messages.map((message) => (
            <button
              key={message.key}
              onClick={() => sendNotification(message.text)}
              className="bg-white hover:bg-gray-100 border-2 border-blue-500 rounded-lg shadow-lg p-8 flex items-center justify-center text-center"
            >
              <div>
                <div className="text-4xl font-bold mb-2">{message.key}</div>
                <div className="text-lg">{message.text}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-grow p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h2 className="text-xl font-bold mb-4">Discord Webhook Settings</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="webhook">
                Discord Webhook URL
              </label>
              <input
                id="webhook"
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://discord.com/api/webhooks/..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your Discord Webhook URL. Notifications will be sent to this webhook.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-bold mb-4">Message Settings</h2>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.key} className="flex items-center border-b pb-2">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full mr-2">
                    {message.key}
                  </div>
                  
                  {isEditing === message.key ? (
                    <div className="flex-grow flex">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 mr-2"
                      />
                      <button 
                        onClick={saveEdit}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-grow">{message.text}</div>
                      <button 
                        onClick={() => editMessage(message.key)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-200 p-2 text-center text-gray-600 text-sm">
        © 2025 One Tap Away
      </footer>
    </div>
  );
}
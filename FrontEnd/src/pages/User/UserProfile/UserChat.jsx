import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Send, MessageSquare } from "lucide-react";

const UserChat = () => {
  const userId = useSelector((state) => state.userDetails.id);
  const userName = useSelector((state) => state.userDetails.first_name);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
  
      const roomName = `user_${userId}_admin`;
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);
      ws.onopen = () =>
        console.log(`Connected to chat with ${roomName}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("sssssssssssssssssssssssssss", data.messages);
        if (data.type === "chat_history") {
          setMessages(data.messages); // Set previous messages
          console.log(data.messages);
        } else if (data.type === "chat_message") {
          setMessages((prev) => [...prev, data]); // Append new message
        }
      };
  
      ws.onclose = () => console.log("WebSocket Disconnected");
      setSocket(ws);
  
      return () => ws.close();
    }, [userId]);

  const sendMessage = () => {
    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      message.trim() !== ""
    ) {
      socket.send(
        JSON.stringify({
          sender: userId,
          receiver: 12,
          sender_name: userName,
          receiver_name: 'Admin',
          message: message,
        })
      );
      setMessage("");
    } else {
      console.error("WebSocket is not ready yet.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-semibold">Customer Support Chat</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Connected with Customer Care Executive</p>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col h-[calc(100vh-200px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender === userId ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {msg.sender === userId ? "You" : "Support Agent"}
                  </p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChat;

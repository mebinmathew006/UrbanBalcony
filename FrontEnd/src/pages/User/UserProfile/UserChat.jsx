import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
const UserChat = () => {
  const userId = useSelector((state) => state.userDetails.id);
  const userName = useSelector((state) => state.userDetails.first_name);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
  const baseurl = import.meta.env.VITE_BASE_URL_FOR_WEBSOCKET;

    if (socketRef.current) {
      console.log("Existing WebSocket found, reusing...");
      return;
    }

    const roomName = `user_${userId}_admin`;
    socketRef.current = new WebSocket(
      `${baseurl}/${roomName}/`
    );

    socketRef.current.onopen = () => {
      console.log(`✅ Connected to chat with ${roomName}`);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_history") {
        setMessages(data.messages);
      } else if (data.type === "chat_message") {
        setMessages((prev) => [...prev, { ...data, sender__first_name: "admin" }]);
      }
    };

    socketRef.current.onclose = () => {
      console.log("❌ WebSocket Disconnected");
      socketRef.current = null; // Prevent using a stale reference
    };

    return () => {
      if (socketRef.current) {
        console.log("🔌 Closing WebSocket...");
        socketRef.current.close();
      }
    };
  }, [userId]); // ✅ Ensures WebSocket updates when user changes

  const sendMessage = () => {
    if (!socketRef.current) {
      // console.error("WebSocket reference is null.");
      toast.error("Something Went Wrong. Please try again", {
        position: "bottom-center",
      });
      return;
    }

    if (socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Something Went Wrong. Please try again", {
        position: "bottom-center",
      });

      // toast.error("WebSocket is not ready yet.");
      return;
    }

    if (message.trim() !== "") {
      socketRef.current.send(
        JSON.stringify({
          sender: userId,
          receiver: 12,
          sender_name: userName,
          receiver_name: "Admin",
          message: message,
        })
      );
      setMessage(""); // ✅ Clear input after sending
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex h-screen  p-4">
      <div className="w-full max-w-2xl mx-auto bg-[#E8D7B4] rounded-lg ">
        {/* Header */}
        <div className="p-4 border-b ">
          <div className="flex items-center gap-2 ">
            <MessageSquare className="w-5 h-5 " />
            <h1 className="text-xl font-semibold ">Customer Support Chat</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Connected with Customer Care Executive
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col h-[calc(100vh-200px)] bg-[#E8D7B4]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`w-[100%] rounded-lg  ${
                    msg.sender === userId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold mb-1 me-3 ms-3 ${
                      msg.sender__first_name == "admin"
                        ? "text-start"
                        : "text-end"
                    }`}
                  >
                    {msg.sender__first_name == "admin" ? "Admin" : "You"}
                  </p>
                  <p
                    className={`text-sm me-3 ms-3 ${
                      msg.sender__first_name == "admin"
                        ? "text-start"
                        : "text-end"
                    }`}
                  >
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t ">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2  bg-white"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="px-4 py-2 bg-green-900 text-white rounded-lg flex items-center gap-2 hover:bg-green-00 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

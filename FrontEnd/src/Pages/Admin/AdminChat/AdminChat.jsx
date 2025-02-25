import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Send, User, MessageSquare, Search } from "lucide-react";
import Sidebar from "../../../Components/Admin/Sidebar/Sidebar";
import adminaxiosInstance from "../../../adminaxiosconfig";
import { toast } from "react-toastify";

const AdminChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const adminId = useSelector((state) => state.userDetails.id);
  const [users, setUsers] = useState([]);
  const[isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const socketRef = useRef(null); // Add a ref for persistent socket reference
  let reconnectTimeout = null;

  async function fetchUsers() {
    try {
      const response = await adminaxiosInstance.get("/chatUserDetails");
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []); // Separate user fetching from WebSocket logic

  useEffect(() => {
    if (!selectedUser) return;
  
    let ws = null;
    let reconnectTimeout = null;
  
    const connectWebSocket = () => {
      const roomName = `user_${selectedUser.id}_admin`;
      ws = new WebSocket(
        `${import.meta.env.VITE_BASE_URL_FOR_WEBSOCKET}/${roomName}/`
      );
  
      ws.onopen = () => {
        console.log(`✅ Connected to chat with ${selectedUser.first_name}`);
        setSocket(ws);
        setIsConnecting(false);
        setConnectionError(null);
      };
  
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data);
          
          if (data.type === "chat_history") {
            setMessages(data.messages);
          } else if (data.type === "chat_message") {
            // Only append new messages
            setMessages(prev => [...prev, {
              sender__id: data.sender__id,
              receiver__id: data.receiver__id,
              sender__first_name: data.sender__first_name,
              receiver__first_name: data.receiver__first_name,
              message: data.message,
              timestamp: data.timestamp
            }]);
          } else if (data.type === "error") {
            toast.error(data.message);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };
  
      ws.onclose = (event) => {
        console.log("❌ WebSocket Disconnected:", event.code);
        setSocket(null);
        if (event.code !== 1000) {
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      };
  
      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setConnectionError("Failed to connect to chat");
        setIsConnecting(false);
      };
    };
  
    connectWebSocket();
  
    return () => {
      if (ws) {
        ws.close(1000);
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to chat with", {
        position: "bottom-center",
      });
      return;
    }
  
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      toast.error("Connection lost. Reconnecting...", {
        position: "bottom-center",
      });
      return;
    }
  
    if (message.trim() === "") {
      return;
    }
  
    try {
      const messageData = {
        sender: adminId,
        receiver: selectedUser.id,
        sender_name: "Admin",
        receiver_name: selectedUser.first_name,
        message: message.trim()
      };
  
      console.log("Sending message:", messageData);
      socket.send(JSON.stringify(messageData));
  
      // Remove optimistic update - wait for server confirmation
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again", {
        position: "bottom-center",
      });
    }
  };
  

  const filteredUsers = users.filter((user) =>
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Rest of your component code...
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-1 h-screen bg-gray-100">
        {/* Users Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold mb-4">Chats</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 absolute left-2 top-3 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setMessage("");
                }}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedUser?.id === user.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{`${user.first_name}_${user.id}`}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {user.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="bg-white p-4 border-b flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-medium">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.sender__first_name === "Admin"
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    {/* Sender Name */}
                    <p className="text-xs text-gray-500 mb-1">
                      {msg.sender__first_name}
                    </p>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[70%] rounded-lg p-3 text-sm ${
                        msg.sender__first_name === "Admin"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-medium mb-2">
                  Welcome to Admin Chat
                </h2>
                <p>Select a user to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;

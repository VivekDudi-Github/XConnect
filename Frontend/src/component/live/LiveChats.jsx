import { useState } from "react";

export default function LiveChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: "You", text: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className="bg-gray-100 p-2 rounded-lg">
            <strong>{msg.user}: </strong>{msg.text}
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white px-4 rounded-lg">
          Send
        </button>
      </div>
    </div>
  );
}

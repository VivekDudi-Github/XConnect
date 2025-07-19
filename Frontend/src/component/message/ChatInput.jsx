import { useState } from "react";
import {  SendIcon , PaperclipIcon } from "lucide-react";

export default function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: handle send logic
    console.log("Sending:", message);
    setMessage("");
  };

  return (
    <div className="flex items-center p-2 gap-2 bg-[#111] rounded-xl border border-gray-700 mt-4 absolute bottom-1 w-[99%]">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 bg-transparent text-white outline-none px-3 py-2"
      />
      <button
        onClick={handleSend}
        className=" p-2 text-cyan-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black transition-colors duration-300 active:scale-95" 
      >
        <PaperclipIcon className="" />
      </button>
      <button
        onClick={handleSend}
        className=" p-2 text-cyan-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black transition-colors duration-300 active:scale-95" 
      >
        <SendIcon className="" />
      </button>
    </div>
  );
}

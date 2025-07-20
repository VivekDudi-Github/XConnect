import { useState } from "react";
import {  SendIcon , PaperclipIcon } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

export default function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: handle send logic
    console.log("Sending:", message);
    setMessage("");
  };

  return (
    <div className="flex items-center p-2 gap-2 bg-[#111] rounded-xl mt-4 absolute sm:bottom-1 bottom-16 w-[99%] focus-within:border-2 border-0 border-white duration-200">   
      <TextareaAutosize
        type="text"
        value={message}
        maxRows={4}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 bg-transparent resize-none text-white outline-none px-3 py-2"
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

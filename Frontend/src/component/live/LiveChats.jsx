import { useEffect, useRef, useState } from "react";
import {ArrowDownIcon} from 'lucide-react' ;

export default function LiveChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const containerRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: "You", text: input }]);
    setInput("");
  };

  useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const { scrollTop, scrollHeight, clientHeight } = container;

  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

  if (distanceFromBottom <= 80) {
    requestAnimationFrame(() => {
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth',
      });
    });
  }
}, [messages]);

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
    {/* Messages area */}
    <div ref={containerRef} className="absolute top-0 left-0 right-0 bottom-[50px] overflow-y-auto p-3 space-y-2 ">
      {messages.map((msg, i) => (
        <div key={i} className="bg-gray-100 w-full text-wrap break-words p-2 rounded-lg fade-in duration-200">
          <strong>{msg.user}: </strong>{msg.text}
        </div>
      ))}
    </div>

    <div>
      <button className="absolute bottom-14 right-2 bg-white p-1 rounded-full shadow-lg active:scale-95 duration-200" onClick={scrollToBottom}>
        <ArrowDownIcon  />
      </button>
    </div>

    {/* Input bar fixed at bottom */}
    <div className="p-1  flex absolute bottom-0 left-0 right-0 ">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Send a message..."
        className="flex-1 p-2 border rounded-lg"
      />
      <button
        onClick={sendMessage}
        className="ml-2 bg-blue-500 text-white px-4 rounded-lg"
      >
        Send
      </button>
    </div>
  </div>
  );
}

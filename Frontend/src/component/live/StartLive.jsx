import { useState, useRef } from "react";
import LiveCard from "./LiveCard";

export default function StartLive() {
  const [title, setTitle] = useState("");
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef();

  const startPreview = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
  };

  const goLive = () => {
    setIsLive(true);
  };

  return (
    <div className="p-6 flex flex-col items-center min-h-screen dark:text-white bg-gray-50 dark:bg-black">
      <h1 className="text-2xl font-bold mb-4">🎬 Go Live</h1>
      <div className="w-full max-w-lg space-y-3">
        <input
          type="text"
          placeholder="Stream title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <button onClick={startPreview} className="px-4 py-2 bg-gray-200 rounded-lg">
          Start Preview
        </button>
        <video ref={videoRef} autoPlay muted className="w-full rounded-2xl" />
        {!isLive ? (
          <button onClick={goLive} className="px-6 py-3 bg-red-600 text-white rounded-xl w-full">
            🔴 Go Live
          </button>
        ) : (
          <button className="px-6 py-3 bg-gray-600 text-white rounded-xl w-full">
            Live...
          </button>
        )}
      </div>
      <LiveCard />
    </div>
  );
}
// 1 there is live home page - has all live streams running // 
// 2 there is live stream room - has all live chats //
// 3 there is start live component - to start live stream //
// 4 there is live chats component - to show all chats //

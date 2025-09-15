import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function VideoPlayer({ stream }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Init player without source
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      fluid: true,
      preload: "auto",
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && stream) {
      const videoEl = playerRef.current.el().querySelector("video");

      if (videoEl && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
        videoEl.muted = true; // allow autoplay

        // Tell video.js the player is ready
        playerRef.current.ready(() => {
          // Mark it as having a "source"
          playerRef.current.trigger("loadedmetadata");

          // Try autoplay
          videoEl.play().catch((err) => {
            console.warn("Autoplay blocked:", err);
          });
        });
      }
    }
  }, [stream]);

  return (
    <div className="w-full h-full">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered rounded-lg overflow-hidden"
        playsInline
      />
    </div>
  );
}

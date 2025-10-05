import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";


export default function VideoPlayer({ stream , audioStream  , src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const audioRef = useRef(null); 
  const isChromium = !!window.chrome;

  useEffect(() => {
    if (!videoRef.current) return;
    // Init player without source
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      aspectRatio: "16:9", 
      fluid: true,
      preload: "auto",
    });
    
    const player = playerRef.current;


    player.ready(() => {
      const playToggle = player.controlBar.playToggle;

      playToggle.off('click');
      playToggle.on('click', () => {
        const videoEl = player.tech().el(); // the real <video>
        if (videoEl.paused) {
          videoEl.play().catch(err => console.log("Resume failed:", err));
        } else {
          videoEl.pause();
        }
      });
    });



    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);


  useEffect(() => {
    if(src) return;
    if (playerRef.current && stream) {
      const videoEl = playerRef.current.el().querySelector("video");
      
      if (videoEl && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
        videoEl.muted = true; // allow autoplay

        // Tell video.js the player is ready
        playerRef.current.ready(() => {
          playerRef.current.trigger("loadedmetadata");
        });
      }
    } 
    
  }, [stream , stream?.active]); 

  useEffect(() => {
    if(src) return;
    if (!audioStream) return;
    if(audioStream.getAudioTracks().length === 0) return ;

    if(audioRef.current){
      audioRef.current.srcObject = audioStream ;
      audioRef.current.muted = true;
      audioRef.current.play().catch(e => {
        console.error("Error playing audio:", e);
      });
    }
  } , [audioStream ]);


useEffect(() => {
  if(src) return;
  if (!audioStream?.active || !playerRef.current || !audioStream) return;
   if(audioStream?.getAudioTracks().length === 0) return ;
  const videoEl = playerRef.current.el().querySelector("video");
  if (!videoEl) return;


  let hiddenAudioEl;

  if (isChromium) {
    // Chrome/Edge needs this trick
    hiddenAudioEl = document.createElement("audio");
    hiddenAudioEl.srcObject = audioStream;
    hiddenAudioEl.autoplay = true;
    hiddenAudioEl.playsInline = true;
    hiddenAudioEl.muted = true;
    hiddenAudioEl.style.display = "none";
    document.body.appendChild(hiddenAudioEl);
  }

  // Web Audio setup
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const source = audioCtx.createMediaStreamSource(audioStream);
  const gainNode = audioCtx.createGain();
  source.connect(gainNode).connect(audioCtx.destination);

  const handleVolumeChange = () => {
    const volume = playerRef.current.volume();
    const muted = playerRef.current.muted();
    gainNode.gain.value = muted ? 0 : volume;
  };
  videoEl.addEventListener("volumechange", handleVolumeChange);

  const resumeAudio = () => {
    audioCtx.resume().catch(err => console.warn("resume failed", err));
    hiddenAudioEl?.play?.().catch(err => console.warn("play failed", err));
  };
  document.addEventListener("click", resumeAudio, { once: true });
  document.addEventListener("keydown", resumeAudio, { once: true });

  return () => {
    videoEl.removeEventListener("volumechange", handleVolumeChange);
    document.removeEventListener("click", resumeAudio);
    document.removeEventListener("keydown", resumeAudio);
    hiddenAudioEl?.remove?.();
    audioCtx.close();
  };
}, [audioStream]);




  return (
      <div className="w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered h-full w-full rounded-lg"
          playsInline
          muted
          autoPlay
          controls
        />
      </div>

  
  );
}

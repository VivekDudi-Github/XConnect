import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function VideoPlayer({ stream , audioStream }) {
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
      fluid: true,
      preload: "auto",
      // userActions: {
      //   click: false,   // 🚫 disables click-to-play/pause on the video display
      // }
    });
    
    const player = playerRef.current;

    // player.ready(() => {
    //   const playToggle = player.controlBar.playToggle;

    //   // 1. Disable default click-to-toggle on the player *completely*
    //   // player.off('tap');   // for mobile tap
    //   // player.off('click'); // for desktop click

    //   // // 2. Add our custom click handler on the *video surface*
    //   // const videoEl = player.el().querySelector("video");

    //   // if (videoEl) {
    //   //   videoEl.onclick = () => {
    //   //     const stream = videoEl.srcObject;
    //   //     if (!stream) return;

    //   //     const videoTrack = stream.getVideoTracks()[0];
    //   //     if (!videoTrack) return;

    //   //     if (videoTrack.enabled) {
    //   //       console.log("Custom pause -> disabling track");
    //   //       videoTrack.enabled = false;
    //   //       playToggle.removeClass('vjs-playing');
    //   //       playToggle.addClass('vjs-paused');
    //   //     } else {
    //   //       console.log("Custom play -> enabling track");
    //   //       videoTrack.enabled = true;
    //   //       playToggle.removeClass('vjs-paused');
    //   //       playToggle.addClass('vjs-playing');
    //   //     }
    //   //   };
    //   // }

    //   // 3. Remove default click handler on the button
    //   if (playToggle) {
    //     playToggle.off('click');
    //     playToggle.on('click', () => {
    //       const stream = player.tech().el().srcObject;
    //       if (!stream) return;

    //       const videoTrack = stream.getVideoTracks()[0];
    //       if (!videoTrack) return;

    //       if (videoTrack.enabled) {
    //         console.log("Custom pause -> disabling track");
    //         videoTrack.enabled = false;
    //         playToggle.removeClass('vjs-playing');
    //         playToggle.addClass('vjs-paused');
    //       } else {
    //         console.log("Custom play -> enabling track");
    //         videoTrack.enabled = true;
    //         playToggle.removeClass('vjs-paused');
    //         playToggle.addClass('vjs-playing');
    //       }
    //     });
    //   }
    // });

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
    
  }, [stream , stream.active]); 

  useEffect(() => {
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

  // useEffect(() => {
  //   if (!audioStream?.active || !audioRef.current || !playerRef.current) return; 
  //   const videoEl = playerRef.current.el().querySelector("video");
  //   if (!videoEl) return;

  //     console.log(audioStream?.active , audioStream.getAudioTracks() , 'audio stream in effect');
      
  //     const audioContext = new AudioContext();
  //     const source = audioContext.createMediaStreamSource(audioStream);
  //     const gainNode = audioContext.createGain();

  //     // Connect nodes
  //     source.connect(gainNode).connect(audioContext.destination);

  //     // Save reference so you can control later
  //     audioRef.current.gainNode = gainNode;
    
  //   const resumeAudio = () => {
  //     audioRef.current
  //       .play()
  //       .then(() => console.log("Audio playback started"))
  //       .catch(err => console.warn("Autoplay blocked:", err));
  //   };

  //   document.addEventListener("click", resumeAudio, { once: true });
  //   document.addEventListener("keydown", resumeAudio, { once: true });

  //   const handleVolumeChange = () => {
  //     const volume = playerRef.current.volume();    // 0.0 - 1.0
  //     const muted = playerRef.current.muted();      // true / false
  //     console.log(volume , muted , 'volume change'); ;
      
  //     // audioRef.current.volume =  volume;
  //     audioRef.current.muted = muted;
  //     audioRef.current.gainNode.gain.value = muted ? 0 : volume;
  //   };

  //   videoEl.addEventListener("volumechange", handleVolumeChange);
  //   return () => {
  //     videoEl.removeEventListener("volumechange", handleVolumeChange);
  //     document.removeEventListener("click", resumeAudio);
  //     document.removeEventListener("keydown", resumeAudio);
  //   };
  // } , [audioStream]);

  // useEffect(() => {
  //   if (!audioStream?.active || !playerRef.current) return;

  //   const videoEl = playerRef.current.el().querySelector("video");
  //   if (!videoEl) return;

  //   console.log(audioStream?.active, audioStream.getAudioTracks(), "audio stream in effect");

  //   // Create context + gain node
  //   const audioContext = new AudioContext();
  //   const source = audioContext.createMediaStreamSource(audioStream);
  //   const gainNode = audioContext.createGain();

  //   source.connect(gainNode).connect(audioContext.destination);

  //   // Save ref for later
  //   audioRef.current = { gainNode, audioContext };

  //   // Resume AudioContext on user gesture (needed for Firefox/Chrome autoplay policies)
  //   const resumeAudio = () => {
  //     if (audioContext.state === "suspended") {
  //       audioContext.resume().then(() => console.log("AudioContext resumed"));
  //     }
  //   };
  //   document.addEventListener("click", resumeAudio, { once: true });
  //   document.addEventListener("keydown", resumeAudio, { once: true });

  //   const handleVolumeChange = () => {
  //     const volume = playerRef.current.volume(); // 0.0 - 1.0
  //     const muted = playerRef.current.muted();
  //     console.log(volume, muted, "volume change");

  //     audioRef.current.gainNode.gain.value = muted ? 0 : volume;
  //   };

  //   videoEl.addEventListener("volumechange", handleVolumeChange);

  //   return () => {
  //     videoEl.removeEventListener("volumechange", handleVolumeChange);
  //     document.removeEventListener("click", resumeAudio);
  //     document.removeEventListener("keydown", resumeAudio);
  //     audioContext.close();
  //   };
  // }, [audioStream]);


useEffect(() => {
  if (!audioStream?.active || !playerRef.current) return;
  const videoEl = playerRef.current.el().querySelector("video");
  if (!videoEl) return;

  console.log("Setting up unified audio pipeline");

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
    console.log("volume change:", volume, muted);
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
    <div className="w-full h-full">
      {/* <audio ref={audioRef} autoPlay playsInline controls muted className=" h-8 " /> */}
      <video muted 
        autoPlay
        ref={videoRef}
        className="video-js vjs-big-play-centered rounded-lg overflow-hidden"
        playsInline
      />

      <button onClick={() => {
        console.log(audioRef.current?.volume , audioRef.current?.muted , 'audio volume');
      }}>click</button> 
    </div>
  );
}

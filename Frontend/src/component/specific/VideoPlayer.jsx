import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function VideoPlayer({ stream , audioStream }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const audioRef = useRef(null); 

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

  useEffect(() => {
    if (!audioStream || !audioRef.current || !playerRef.current) return; 
    const videoEl = playerRef.current.el().querySelector("video");
    if (!videoEl) return;

    const handleVolumeChange = () => {
      const volume = playerRef.current.volume();    // 0.0 - 1.0
      const muted = playerRef.current.muted();      // true / false
      console.log(volume , muted , 'volume change'); ;
      
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    };

    videoEl.addEventListener("volumechange", handleVolumeChange);
    return () => {
      videoEl.removeEventListener("volumechange", handleVolumeChange);

    };
  } , [audioStream]);


  
  return (
    <div className="w-full h-full">
      <video 
        autoPlay
        ref={videoRef}
        className="video-js vjs-big-play-centered rounded-lg overflow-hidden"
        playsInline
      />
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
    </div>
  );
}

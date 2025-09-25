import React, { useRef, useState, useEffect , useCallback } from "react";
import { Device } from "mediasoup-client";
import { useSocket } from "../socket";
// import ReceiveBroadcast from "./RecieveBroadcast";
import VideoPlayer from "../VideoPlayer";


  // const videoRef = useRef(null);
  // const deviceRef = useRef(null);
  // const producerTransportRef = useRef(null);
  // const producersRef = useRef([]); // store producer objects (audio/video)
  // const localStreamRef = useRef(null);

  
  // // const [roomId , setRoomId] = useState(null);
  // const [isLive, setIsLive] = useState(false);
  // const [videoProducer , setVideoProducer] = useState(null);
  // const [cameraOn , setCameraOn] = useState(false);
  

  const changeVideoSource = async() => {
    if(!videoProducer) return ;
      let stream ;
      if(cameraOn){
        stream = await navigator.mediaDevices.getDisplayMedia({ video : true , audio : false })
      }else {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) 
      }
      let oldTrack  = videoProducer.track ;
      let newTrack = stream.getVideoTracks()[0];

      if(!newTrack) return ;
      
      await videoProducer.replaceTrack({ track: newTrack });
      if(oldTrack) oldTrack.stop();

      localStreamRef.current.removeTrack(oldTrack);
      localStreamRef.current.addTrack(newTrack);
      
      setCameraOn(!cameraOn);
  }

  async function startBroadcast(roomId , cameraOn = true , socket ) {
    const localStreamRef = useRef(null);
    const producerTransportRef = useRef(null);
    const producersRef = useRef([]); // store producer objects (audio/video)

    const [videoProducer , setVideoProducer] = useState(null);

  if (!socket || !roomId) {
      console.error("Socket or RoomId not connected");
      return;
    }
    try {
    const getCamera = async() => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) ;
      localStreamRef.current = stream;
    }
    const getDisplay = async() => {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }) ;
      localStreamRef.current = stream;
    }
      // 1) get camera + mic
      if(cameraOn) {
        getCamera();
      }else {
        getDisplay();
      }
      
      // 2) ask server for router RTP capabilities, load Device
      socket.emit("getRtpCapabilities", async (routerRtpCapabilities) => {
        const device = new Device();
        await device.load({ routerRtpCapabilities });
        deviceRef.current = device;

        // 3) ask server to create a producer transport
        socket.emit("createWebRtcTransport", async (params) => {
          // params: { id, iceParameters, iceCandidates, dtlsParameters }
          const producerTransport = device.createSendTransport(params);
          producerTransportRef.current = producerTransport;
          console.log('createWebRtcTransport created');
          

          // when transport needs to connect (DTLS)
          producerTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
            socket.emit("connectProducerTransport", { dtlsParameters, transportId: producerTransport.id }, () => {
              callback(); // tell transport it's connected
              console.log('connectProducerTransport connected', producerTransport.id);
            });
          });

          // when transport needs to produce a new track - tell server
          producerTransport.on("produce", async ({ kind, rtpParameters  }, callback, errback) => {
            socket.emit("produce", { kind, rtpParameters , roomId , transportId: producerTransport.id  }, ({ id , error}) => {
              if(error){
                console.error("produce error:", error);
                return ;
              }
              callback({ id }); // give the transport the server-side producer id
              console.log('produce id : ', id);
            });
          });




          // 4) produce tracks (video + audio)
          // video
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if(videoTrack){
            const videoProducer = await producerTransport.produce({ track: videoTrack });
            producersRef.current.push(videoProducer);
            setVideoProducer(videoProducer);
          }

          // audio
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          if(audioTrack){
            const audioProducer = await producerTransport.produce({ track: audioTrack });
            producersRef.current.push(audioProducer);
          }

          setIsLive(true);
          console.log("Broadcast started");
        });
      });
      return {localStreamRef , producerTransportRef , producersRef , videoProducer };
    } catch (err) {
      console.error("startBroadcast error:", err);
    }
  }

  async function stopBroadcast(producersRef , localStreamRef) {
    // close producers
    for (const p of producersRef.current) {
      try { await p.close(); } catch(_) {}
    }
    producersRef.current = [];

    // close transport
    try { producerTransportRef.current && producerTransportRef.current.close(); } catch(_) {}

    // stop tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }

    console.log("Broadcast stopped");
  }

  export {startBroadcast , stopBroadcast} ; 
    // <div>
    //   <h3>Broadcaster</h3>
    
    //     {/* <video ref={videoRef} controls style={{ width: "640px", height: "360px", background: "#000" }} autoPlay playsInline /> */}
    //     <VideoPlayer 
    //       stream={localStreamRef.current} 
    //       audioStream={localStreamRef.current} 
    //       />
    //     <button className="border-black border-2"  onClick={changeVideoSource}>Change Video Source</button>
    //   <div style={{ marginTop: 8 }}>
    //     {!isLive ? (
    //       <button className="border-black border-2"  onClick={startBroadcast}>Go Live</button>
    //     ) : (
    //       <button className="border-black border-2"  onClick={stopBroadcast}>Stop</button>
    //     )}
    //   </div>
    //   <ReceiveBroadcast />
    // </div>


export function useBroadcast(socket, roomId) {
  const localStreamRef = useRef(null);
  const producerTransportRef = useRef(null);
  const producersRef = useRef([]); // all producers (audio + video)
  const deviceRef = useRef(null);

  const [isLive, setIsLive] = useState(false);
  const [videoProducer, setVideoProducer] = useState(null);

  // Start broadcast
  const startBroadcast = useCallback(
    async (cameraOn = true) => {
      if (!socket || !roomId) {
        console.error("Socket or RoomId not connected");
        return;
      }

      try {
        // 1) Capture media
        localStreamRef.current = cameraOn
          ? await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          : await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

        // 2) Get router RTP caps & load device
        socket.emit("getRtpCapabilities", async (routerRtpCapabilities) => {
          const device = new Device();
          await device.load({ routerRtpCapabilities });
          deviceRef.current = device;

          // 3) Ask server for send transport
          socket.emit("createWebRtcTransport", async (params) => {
            const producerTransport = device.createSendTransport(params);
            producerTransportRef.current = producerTransport;

            // Transport connect
            producerTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
              socket.emit(
                "connectProducerTransport",
                { dtlsParameters, transportId: producerTransport.id },
                () => callback()
              );
            });

            // Transport produce
            producerTransport.on("produce", async ({ kind, rtpParameters }, callback) => {
              socket.emit(
                "produce",
                { kind, rtpParameters, roomId, transportId: producerTransport.id },
                ({ id, error }) => {
                  if (error) {
                    console.error("produce error:", error);
                    return;
                  }
                  callback({ id });
                }
              );
            });

            // 4) Produce tracks
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
              const vp = await producerTransport.produce({ track: videoTrack });
              producersRef.current.push(vp);
              setVideoProducer(vp);
            }

            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
              const ap = await producerTransport.produce({ track: audioTrack });
              producersRef.current.push(ap);
            }

            setIsLive(true);
          });
        });
      } catch (err) {
        console.error("startBroadcast error:", err);
      }
    },
    [socket, roomId]
  );

  // Stop broadcast
  const stopBroadcast = useCallback(() => {
    // Close producers
    producersRef.current.forEach((p) => {
      try {
        p.close();
      } catch (_) {}
    });
    producersRef.current = [];

    // Close transport
    try {
      producerTransportRef.current?.close();
    } catch (_) {}

    // Stop tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    setIsLive(false);
    setVideoProducer(null);
    console.log("Broadcast stopped");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBroadcast();
    };
  }, [stopBroadcast]);

  return {
    isLive,
    videoProducer,
    startBroadcast,
    stopBroadcast,
    localStreamRef,
  };
}

  


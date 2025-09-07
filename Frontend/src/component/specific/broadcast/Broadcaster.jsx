import React, { useRef, useState, useEffect } from "react";
import { Device } from "mediasoup-client";
import { useSocket } from "../socket";

export default function Broadcaster() {
  const videoRef = useRef(null);
  const deviceRef = useRef(null);
  const producerTransportRef = useRef(null);
  const producersRef = useRef([]); // store producer objects (audio/video)
  const localStreamRef = useRef(null);
  

  const [isLive, setIsLive] = useState(false);
  console.log(isLive);
  
  const socket = useSocket();
  
  async function startBroadcast() {
  if (!socket) {
      console.error("Socket not connected");
      return;
    }
    try {
      // 1) get camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      await videoRef.current.play();
      console.log(!!socket);
      
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
            socket.emit("connectProducerTransport", { dtlsParameters  }, () => {
            callback(); // tell transport it's connected
            console.log('connectProducerTransport connected');
            });
          });

          // when transport needs to produce a new track - tell server
          producerTransport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
            socket.emit("produce", { kind, rtpParameters ,transportId : producerTransport._id }, ({ id }) => {
              callback({ id }); // give the transport the server-side producer id
              console.log('produce id : ' ,id);
            });
          });

          // 4) produce tracks (video + audio)
          // video
          const videoTrack = stream.getVideoTracks()[0];
          const videoProducer = await producerTransport.produce({ track: videoTrack });
          producersRef.current.push(videoProducer);

          // audio
          const audioTrack = stream.getAudioTracks()[0];
          const audioProducer = await producerTransport.produce({ track: audioTrack });
          producersRef.current.push(audioProducer);

          setIsLive(true);
          console.log("Broadcast started");
        });
      });
    } catch (err) {
      console.error("startBroadcast error:", err);
    }
  }

  async function stopBroadcast() {
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

    setIsLive(false);
    console.log("Broadcast stopped");
  }

  return (
    <div>
      <h3>Broadcaster</h3>
    
        <video ref={videoRef} controls style={{ width: "640px", height: "360px", background: "#000" }} autoPlay playsInline />
      
      <div style={{ marginTop: 8 }}>
        {!isLive ? (
          <button onClick={startBroadcast}>Go Live</button>
        ) : (
          <button onClick={stopBroadcast}>Stop</button>
        )}
      </div>
    </div>
  );
}

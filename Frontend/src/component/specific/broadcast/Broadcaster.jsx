import React, { useRef, useState, useEffect } from "react";
import { Device } from "mediasoup-client";
import { useSocket } from "../socket";
import ReceiveBroadcast from "./RecieveBroadcast";
import VideoPlayer from "../VideoPlayer";

export default function Broadcaster() {
  const videoRef = useRef(null);
  const deviceRef = useRef(null);
  const producerTransportRef = useRef(null);
  const producersRef = useRef([]); // store producer objects (audio/video)
  const localStreamRef = useRef(null);
  
  // const [roomId , setRoomId] = useState(null);
  const [isLive, setIsLive] = useState(false);
  console.log(isLive);
  
  const socket = useSocket();
  
  async function startBroadcast() {
  if (!socket) {
      console.error("Socket not connected");
      return;
    }
    try {
      let roomId = 'ce48af5b-5a75-4c29-95bb-3b6756f14d54' ;
      let creator = false ;
      // create or join room
      // await socket.emit("joinMeeting", roomId, ({error , success}) => {
      //     if (error) {
      //       console.error("Error joining meeting:", error);
      //       socket.emit("createMeeting", ( res)  => {
      //         creator = true ;
      //         if(res?.error){
      //           console.error("createMeeting error:", res.error); 
      //           return ;
      //         }
      //         roomId = res.roomId ;
      //         console.log("createMeeting", res.roomId);
      //       });
      //       return;
      //     }
      //   });
      
      function joinMeeting(socket, roomId) {
        return new Promise((resolve, reject) => {
          socket.emit("joinMeeting", roomId, (response) => {
            if (response.error) {
              socket.emit("createMeeting", (res) => {
                if (res?.error) {
                  return reject(res.error);
                }
                return resolve({ creator: true, roomId: res.roomId });
              });
            } else {
              return resolve({ creator: false, roomId });
            }
          });
        });
      }

      const { creator: isCreator, roomId: joinedRoomId } = await joinMeeting(socket, roomId);

      console.log(creator);
        
      // 1) get camera + mic
      let stream ;
      if(isCreator){
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) ;
      }else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }) ;
      }

      localStreamRef.current = stream;
      // videoRef.current?.srcObject = stream;
      // videoRef.current?.muted = true;
      // await videoRef?.current?.play();
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
          const videoTrack = stream.getVideoTracks()[0];
          if(videoTrack){
            const videoProducer = await producerTransport.produce({ track: videoTrack });
            producersRef.current.push(videoProducer);
          }

          // audio
          const audioTrack = stream.getAudioTracks()[0];
          if(audioTrack){
            const audioProducer = await producerTransport.produce({ track: audioTrack });
            producersRef.current.push(audioProducer);
          }

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
    videoRef.current.srcObject = null;
  }

  return (
    <div>
      <h3>Broadcaster</h3>
    
        {/* <video ref={videoRef} controls style={{ width: "640px", height: "360px", background: "#000" }} autoPlay playsInline /> */}
        <VideoPlayer 
          stream={localStreamRef.current} 
          audioStream={localStreamRef.current} 
          />

      <div style={{ marginTop: 8 }}>
        {!isLive ? (
          <button className="border-black border-2"  onClick={startBroadcast}>Go Live</button>
        ) : (
          <button className="border-black border-2"  onClick={stopBroadcast}>Stop</button>
        )}
      </div>
      <ReceiveBroadcast />
    </div>
  );
}

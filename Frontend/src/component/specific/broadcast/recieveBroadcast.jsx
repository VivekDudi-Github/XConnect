import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useSocket } from "../socket";


const ReceiveBroadcast = () => {
  
  let roomId = 'ce48af5b-5a75-4c29-95bb-3b6756f14d54' ;
  const videoRef = useRef(null);
  const [device, setDevice] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState(null);


  const socket = useSocket();

    const init = async () => {
      if (!socket){
        console.error("Socket not connected");
        return;
      }
      console.log('init called');
      // 1. Load RTP capabilities from server
      socket.emit("getRtpCapabilities",async (routerRtpCapabilities) => {
        const dev = new mediasoupClient.Device();
        await dev.load({routerRtpCapabilities} );
        setDevice(dev);
        console.log("RTP Capabilities");
        
        // 2. Create consumer transport
        socket.emit("createConsumerTransport", async (params) => {
          const transport = dev.createRecvTransport(params);

          transport.on("connect", ({ dtlsParameters }, callback, errback) => {
            socket.emit(
              "connectConsumerTransport",
              { transportId: transport.id, dtlsParameters },
              callback
            );
          });

          setConsumerTransport(transport);

          // 3. Get the list of producers from server
          socket.emit("getProducers", roomId, async (producers) => {
            console.log("Available producers:", producers);
            
            const stream = new MediaStream();
            
            // 4. Consume each producer
            for (const p_ of producers) {
              //create new mediastream
              //add the tracks in further loop
              //and add the stream to Stream-state 
              for( const p  of p_.p){ 
                socket.emit(
                "consume",
                {
                  rtpCapabilities: dev.rtpCapabilities,
                  producerId: p.id,
                  transportId: transport.id,
                  roomId
                },
                async ({ id, producerId, kind, rtpParameters , error }) => {
                  if(error) {
                    console.error("Consume error:", error);
                    return;
                  }
                  const consumer = await transport.consume({
                    id,
                    producerId,
                    kind,
                    rtpParameters,
                  });
                  

                  stream.addTrack(consumer.track);
                  videoRef.current.srcObject = stream;
                  
                  console.log(consumer.track.readyState , consumer.getStats , consumer.track.kind) ;
                  await consumer.resume();
                  
                  socket.emit("resumeConsumer", { consumerId: id , roomId });
                }
              );
              }
            }
          });
        });
      });
    };


  return (
    <div>
      <h2>Receiver</h2>
      <video
        ref={videoRef}
        style={{ width: "640px", height: "360px" }}
        autoPlay
        playsInline
        controls
      />
    <button className="border-black border-2"  onClick={init}>Join Broadcast</button>
    </div>
    
  );
};

export default ReceiveBroadcast;













// crearte join meeting 
// 
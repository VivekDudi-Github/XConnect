import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useSocket } from "../socket";
import Videojs from "video.js"
import VideoPlayer from "../VideoPlayer";

const ReceiveBroadcast = () => {
  
  let roomId = 'ce48af5b-5a75-4c29-95bb-3b6756f14d54' ;
  const [streams , setStreams] = useState([]) ;

  const socket = useSocket();

    const init = async () => {
      if (!socket){
        console.error("Socket not connected");
        return;
      }
      console.log('init called');
      socket.emit("joinMeeting", roomId, ({error , success}) => {
        if (error) {
          console.error("Error joining meeting:", error);
          return;
        }
      });
      // 1. Load RTP capabilities from server
      socket.emit("getRtpCapabilities",async (routerRtpCapabilities) => {
        const dev = new mediasoupClient.Device();
        await dev.load({routerRtpCapabilities} );
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


          // 3. Get the list of producers from server
          socket.emit("getProducers", roomId, async (producers) => {
            console.log("Available producers:", producers);
            
            let obj = {} ;
            // 4. Consume each producer
            for (const p_ of producers) {
              //create new mediastream
              //add the tracks in further loop
              //and add the stream to Stream-state 
              obj.user = p_.user ;
              obj.producers = [] ;
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
                  const stream = new MediaStream();

                  stream.addTrack(consumer.track);
                  obj.producers.push({stream , producerId , kind , consumerId : id}) ;
                  
                  console.log(consumer.track.readyState , await consumer.getStats() , consumer.track.kind) ;
                  await consumer.resume();
                  
                  socket.emit("resumeConsumer", { consumerId: id , roomId });
                }
              );
              }
              console.log(obj);
              setStreams((prev) => [...prev , obj]) ;

            }
          });
        });
      });
    };

  function bundleUserStream(producers) {
    const mediaStream = new MediaStream();
    producers.forEach(p => {
      if (p.stream) {
        p.stream.getTracks().forEach(track => mediaStream.addTrack(track));
      }
    });
    return mediaStream;
  }


  return (
    <div>
      <h2>Receiver</h2>
      {streams.map((s , i) => {
        const stream = bundleUserStream(s.producers);
        console.log(stream , 'bundled stream');
        
        return (
          <div key={i}>
            <h3>User : {s.user.username}</h3>
            
            <VideoPlayer stream={stream} />
          </div>
          )
        })
      }
    <button className="border-black border-2"  onClick={init}>Join Broadcast</button>
    </div>
    
  );
};

export default ReceiveBroadcast;













// crearte join meeting 
// 
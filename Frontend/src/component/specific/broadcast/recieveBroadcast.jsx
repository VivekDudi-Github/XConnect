import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useSocket } from "../socket";
import Videojs from "video.js"
import VideoPlayer from "../VideoPlayer";

const ReceiveBroadcast = () => {
  
  let roomId = 'ce48af5b-5a75-4c29-95bb-3b6756f14d54' ;
  const [streams , setStreams] = useState([]) ;
  const rtcCapablities = useRef(null) ;
  const transportRef = useRef(null) ;

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
        rtcCapablities.current = routerRtpCapabilities ;
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

          transportRef.current = transport ;
          console.log(transport , "setTransport"); 
          

          // 3. Get the list of producers from server
          socket.emit("getProducers", roomId, async (producers) => {
            console.log("Available producers:", producers);
            

            // 4. Consume each producer
            for (const p_ of producers) {
              //add the tracks in further loop
              //and add the stream to Stream-state 
              let obj = {} ;
              obj.user = p_.user ;
              obj.producers = [] ;

              for( const p  of p_.p){ 
                socket.emit(
                "consume",
                {
                  rtpCapabilities: dev.rtpCapabilities,
                  producerId: p.id,
                  transportId: transport.id,
                  roomId,
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

                  // stream.addTrack(consumer.track);
                  obj.producers.push({track : consumer.track , producerId , kind , consumerId : id}) ;
                  
                  await consumer.resume();
                  
                  socket.emit("resumeConsumer", { consumerId: id , roomId });

                  // Update state immutably
                  setStreams(prev => {
                    // check if user already exists
                    const userExists = prev.some(s => s.user.userId === p_.user.userId);

                    if (userExists) {
                      // update existing
                      return prev.map(s =>
                        s.user.userId === p_.user.userId
                          ? {
                              ...s,
                              producers: [
                                ...s.producers,
                                {
                                  track: consumer.track,
                                  producerId,
                                  kind,
                                  consumerId: id,
                                },
                              ],
                            }
                          : s
                      );
                    } else {
                      // add new user entry
                      return [
                        ...prev,
                        {
                          user: p_.user,
                          producers: [
                            {
                              track: consumer.track,
                              producerId,
                              kind,
                              consumerId: id,
                            },
                          ],
                        },
                      ];
                    }
                  });
                }
              );
              }
            }
          });
        });
      });
    };
  console.log(streams , 'all streams');
  function bundleUserStream(producers) {
    const mediaStream = new MediaStream();
    const audioStream = new MediaStream();
    producers.forEach(p => {
      if (p.track && p.kind === 'video') {
        mediaStream.addTrack(p.track);
      } else if (p.track && p.kind === 'audio') {
        audioStream.addTrack(p.track);
      }
    });
    return {mediaStream , audioStream};
  }

  console.log(streams.length , 'streams length');
  
  useEffect(() => {
    if (!socket) return;
    init();
    socket.on("removeBroadcastUser", ({userId}) => {
      console.log("Removing consumer:", "for user:", userId);
      setStreams(prevStreams =>
        prevStreams.filter(s => s.user.userId !== userId)
      );
    });

    socket.on("NewUserToBroadcast", async({ user , p : p_ }) => {
      console.log("New user to broadcast:", user , p_);
      
      for( const p  of p_){
        socket.emit("consume", {
          rtpCapabilities: rtcCapablities.current,
          producerId: p.id,
          transportId: transportRef.current.id,
          roomId,
        },
      
        async ({ id, producerId, kind, rtpParameters , error }) => {
          if(error) {
            console.error("Consume error:", error);
            return;
          }
          
          const consumer = await transportRef.current.consume({
            id,
            producerId,
            kind,
            rtpParameters,
          });

          // stream.addTrack(consumer.track);
          await consumer.resume();
          
          socket.emit("resumeConsumer", { consumerId: id , roomId });

          // Update state immutably
          setStreams(prev => {
            // check if user already exists
            const userExists = prev.some(s => s.user.userId === user.userId);

            if (userExists) {
              // update existing
              return prev.map(s =>
                s.user.userId === user.userId
                  ? {
                      ...s,
                      producers: [
                        ...s.producers,
                        {
                          track: consumer.track,
                          producerId,
                          kind,
                          consumerId: id,
                        },
                      ],
                    }
                  : s
              );
            } else {
              // add new user entry
              return [
                ...prev,
                {
                  user: user,
                  producers: [
                    {
                      track: consumer.track,
                      producerId,
                      kind,
                      consumerId: id,
                    },
                  ],
                },
              ];
            }
          });
        }
      );
      }
    })
  } , [socket])



  return (
    <div>
      <h2>Receiver</h2>
      {streams.map((s , i) => {
        const {mediaStream , audioStream} = bundleUserStream(s.producers);
        console.log(mediaStream?.active , audioStream?.active , 'bundled stream');
        
        return (
          <div className="flex flex-col gap-8" key={i}>
            <h3>User : {s.user.username}</h3>
            
            <VideoPlayer stream={mediaStream} audioStream={audioStream} />
          </div>
          )
        })
      }
    <button className="border-black border-2"  onClick={init}>Join Broadcast</button>
    </div>
    
  );
};

export default ReceiveBroadcast;

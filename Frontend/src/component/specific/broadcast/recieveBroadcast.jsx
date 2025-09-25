import React, { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useSocket } from "../socket";
import Videojs from "video.js"
import VideoPlayer from "../VideoPlayer";

// const ReceiveBroadcast = () => {
  
  // let roomId = 'ce48af5b-5a75-4c29-95bb-3b6756f14d54' ;
  // // const [streams , setStreams] = useState([]) ;
  // const rtcCapablities = useRef(null) ;
  // const transportRef = useRef(null) ;

  
  // const init = async (socket) => {
  // const [streams , setStreams] = useState([]) ;
  
  // const rtcCapablities = useRef(null) ;
  // const transportRef = useRef(null) ;

  //   if (!socket){
  //     console.error("Socket not connected");
  //     return;
  //   }
  //   console.log('init called');
  //   // 1. Load RTP capabilities from server
  //   try {
  //     socket.emit("getRtpCapabilities",async (routerRtpCapabilities) => {
  //       const dev = new mediasoupClient.Device();
  //       await dev.load({routerRtpCapabilities} );
  //       rtcCapablities.current = routerRtpCapabilities ;
  //       console.log("RTP Capabilities");
  
  //       // 2. Create consumer transport
  //       socket.emit("createConsumerTransport", async (params) => {
  //         const transport = dev.createRecvTransport(params);
  
  //         transport.on("connect", ({ dtlsParameters }, callback, errback) => {
  //           socket.emit(
  //             "connectConsumerTransport",
  //             { transportId: transport.id, dtlsParameters },
  //             callback
  //           );
  //         });
  
  //         transportRef.current = transport ;
  //         console.log(transport , "setTransport"); 
          
  
  //         // 3. Get the list of producers from server
  //         socket.emit("getProducers", roomId, async (producers) => {
  //           console.log("Available producers:", producers);
            
  
  //           // 4. Consume each producer
  //           for (const p_ of producers) {
  //             //add the tracks in further loop
  //             //and add the stream to Stream-state 
  //             let obj = {} ;
  //             obj.user = p_.user ;
  //             obj.producers = [] ;
  
  //             for( const p  of p_.p){ 
  //               socket.emit(
  //               "consume",
  //               {
  //                 rtpCapabilities: dev.rtpCapabilities,
  //                 producerId: p.id,
  //                 transportId: transport.id,
  //                 roomId,
  //               },
              
  //               async ({ id, producerId, kind, rtpParameters , error }) => {
  //                 if(error) {
  //                   console.error("Consume error:", error);
  //                   return;
  //                 }
                  
  //                 const consumer = await transport.consume({
  //                   id,
  //                   producerId,
  //                   kind,
  //                   rtpParameters,
  //                 });
  
  //                 // stream.addTrack(consumer.track);
  //                 obj.producers.push({track : consumer.track , producerId , kind , consumerId : id}) ;
                  
  //                 await consumer.resume();
                  
  //                 socket.emit("resumeConsumer", { consumerId: id , roomId });
  
  //                 setStreams(prev => {
  //                   // check if user already exists
  //                   const userExists = prev.some(s => s.user.userId === p_.user.userId);
  
  //                   if (userExists) {
  //                     // update existing
  //                     return prev.map(s =>
  //                       s.user.userId === p_.user.userId
  //                         ? {
  //                             ...s,
  //                             producers: [
  //                               ...s.producers,
  //                               {
  //                                 track: consumer.track,
  //                                 producerId,
  //                                 kind,
  //                                 consumerId: id,
  //                               },
  //                             ],
  //                           }
  //                         : s
  //                     );
  //                   } else {
  //                     // add new user entry
  //                     return [
  //                       ...prev,
  //                       {
  //                         user: p_.user,
  //                         producers: [
  //                           {
  //                             track: consumer.track,
  //                             producerId,
  //                             kind,
  //                             consumerId: id,
  //                           },
  //                         ],
  //                       },
  //                     ];
  //                   }
  //                 });
  //               }
  //             );
  //             }
  //           }
  //         });
  //       });
  //     });
  //     return { streams , rtcCapablities , transportRef };
  //   } catch (error) {
  //     console.error('error in init funtion' , error);
  //   }
  // };
  // console.log(streams , 'all streams');
  // function bundleUserStream(producers) {
  //   const mediaStream = new MediaStream();
  //   const audioStream = new MediaStream();
  //   producers.forEach(p => {
  //     if (p.track && p.kind === 'video') {
  //       mediaStream.addTrack(p.track);
  //     } else if (p.track && p.kind === 'audio') {
  //       audioStream.addTrack(p.track);
  //     }
  //   });
  //   return {mediaStream , audioStream};
  // }

  // console.log(streams.length , 'streams length');
  
  // useEffect(() => {
  //   if (!socket) return;
  //   init();
  //   socket.on("removeBroadcastUser", ({userId}) => {
  //     console.log("Removing consumer:", "for user:", userId);
  //     setStreams(prevStreams =>{
  //       const leavingUser = prevStreams.find(s => s.user.userId === userId)
  //       if(leavingUser){
  //         leavingUser.producers.forEach((p) => {
  //           if(p.consumer) p.consumer.close();
  //         })
  //       }
  //       return prevStreams.filter(s => s.user.userId !== userId)
  //     });
  //   });

  //   socket.on("NewUserToBroadcast", async({ user , p : p_ }) => {
  //     console.log("New user to broadcast:", user , p_);
      
  //     for( const p  of p_){
  //       socket.emit("consume", {
  //         rtpCapabilities: rtcCapablities.current,
  //         producerId: p.id,
  //         transportId: transportRef.current.id,
  //         roomId,
  //       },
      
  //       async ({ id, producerId, kind, rtpParameters , error }) => {
  //         if(error) {
  //           console.error("Consume error:", error);
  //           return;
  //         }
          
  //         const consumer = await transportRef.current.consume({
  //           id,
  //           producerId,
  //           kind,
  //           rtpParameters,
  //         });

  //         // stream.addTrack(consumer.track);
  //         await consumer.resume();
          
  //         socket.emit("resumeConsumer", { consumerId: id , roomId });

  //         // Update state immutably
  //         setStreams(prev => {
  //           // check if user already exists
  //           const userExists = prev.some(s => s.user.userId === user.userId);

  //           if (userExists) {
  //             // update existing
  //             return prev.map(s =>
  //               s.user.userId === user.userId
  //                 ? {
  //                     ...s,
  //                     producers: [
  //                       ...s.producers,
  //                       {
  //                         track: consumer.track,
  //                         producerId,
  //                         kind,
  //                         consumerId: id,
  //                       },
  //                     ],
  //                   }
  //                 : s
  //             );
  //           } else {
  //             // add new user entry
  //             return [
  //               ...prev,
  //               {
  //                 user: user,
  //                 producers: [
  //                   {
  //                     track: consumer.track,
  //                     producerId,
  //                     kind,
  //                     consumerId: id,
  //                   },
  //                 ],
  //               },
  //             ];
  //           }
  //         });
  //       }
  //     );
  //     }
  //   })
  // } , [socket])


// create layout for each user // create mute linked to list , mute all , unmute all , mute individual // 
// add more funtion like add password , add audio only , add video only , add screen share , add chat 

// add the reciever im the meeting page and the add the broadcasting as a hook in the meeting layout
// joining and creating rooms will be managed in the meeting layout
// streams and their layout with producers will be managed in the meeting page.



    // {<div>
    //   <h2>Receiver</h2>
    //   {streams.map((s , i) => {
    //     const {mediaStream , audioStream} = bundleUserStream(s.producers);
    //     console.log(mediaStream?.active , audioStream?.active , 'bundled stream');
        
    //     return (
    //       <div className="flex flex-col gap-8" key={i}>
    //         <h3>User : {s.user.username}</h3>
            
    //         <VideoPlayer stream={mediaStream} audioStream={audioStream} />
    //       </div>
    //       )
    //     })
    //   }
    // <button className="border-black border-2"  onClick={init}>Join Broadcast</button>
    // </div>}
// export default ReceiveBroadcast


export function useMediasoupConsumers(roomId, socket) {
  const [streams, setStreams] = useState([]);
  const rtcCapabilities = useRef(null);
  const transportRef = useRef(null);
  const deviceRef = useRef(null);
  const consumersRef = useRef([]);

  const init = useCallback(async () => {
    if (!socket) return;
    if (transportRef.current) return; // prevent double init
    console.log('init called');
    
    try {
      // 1. Get RTP capabilities
      socket.emit("getRtpCapabilities", async (routerRtpCapabilities) => {
        const dev = new mediasoupClient.Device();
        await dev.load({ routerRtpCapabilities });
        deviceRef.current = dev;
        rtcCapabilities.current = routerRtpCapabilities;

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

          transportRef.current = transport;

          // 3. Fetch producers
          socket.emit("getProducers", roomId, async (producers) => {
            for (const p_ of producers) {
              let obj = { user: p_.user, producers: [] };

              for (const p of p_.p) {
                socket.emit(
                  "consume",
                  {
                    rtpCapabilities: dev.rtpCapabilities,
                    producerId: p.id,
                    transportId: transport.id,
                    roomId,
                  },
                  async ({ id, producerId, kind, rtpParameters, error }) => {
                    if (error) return console.error("Consume error:", error);

                    const consumer = await transport.consume({
                      id,
                      producerId,
                      kind,
                      rtpParameters,
                    });

                    consumersRef.current.push(consumer); 

                    obj.producers.push({
                      track: consumer.track,
                      producerId,
                      kind,
                      consumer: consumer,
                    });

                    await consumer.resume();
                    socket.emit("resumeConsumer", { consumerId: id, roomId });

                    setStreams((prev) => {
                      const userExists = prev.some(
                        (s) => s.user.userId === p_.user.userId
                      );
                      if (userExists) {
                        return prev.map((s) =>
                          s.user.userId === p_.user.userId
                            ? {
                                ...s,
                                producers: [...s.producers, obj.producers[0]],
                              }
                            : s
                        );
                      } else {
                        return [...prev, obj];
                      }
                    });
                  }
                );
              }
            }
          });
        });
      });
    } catch (err) {
      console.error("Init error:", err);
    }
  }, [roomId, socket]);

  // ✅ Cleanup function
  const cleanup = useCallback(() => {
    // Close all consumers
    consumersRef.current.forEach((c) => {
      try {
        c.close();
      } catch (e) {}
    });
    consumersRef.current = [];

    // Close transport
    if (transportRef.current) {
      try {
        transportRef.current.close();
      } catch (e) {}
      transportRef.current = null;
    }

    // Clear device + caps
    deviceRef.current = null;
    rtcCapabilities.current = null;

    // Reset state
    setStreams([]);
  }, []);

  // Run cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);


  useEffect(() => {
    if (!socket) return;
    
     const AddNewUser = async({ user , p : p_ }) => {
      
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
          consumersRef.current.push(consumer);
          socket.emit("resumeConsumer", { consumerId: id , roomId });

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
                          consumer,
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
                      consumer,
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
    const removeOldUser = ({userId}) => {
      console.log("Removing consumer:", "for user:", userId);
      setStreams(prevStreams =>{
        const leavingUser = prevStreams.find(s => s.user.userId === userId)
        if(leavingUser){
          leavingUser.producers.forEach((p) => {
            if(p.consumer) p.consumer.close();
          })
        }
        return prevStreams.filter(s => s.user.userId !== userId)
      });
    };


    socket.on("removeUserFromMeeting", removeOldUser ) 
    socket.on("NewUserToMeeting", AddNewUser)

    return () => {
      socket.off("removeUserFromMeeting" , removeOldUser);
      socket.off("NewUserToMeeting" , AddNewUser);
    } 
  } , [socket , init , roomId])

  return { streams, rtcCapabilities, transportRef, init, cleanup };
}

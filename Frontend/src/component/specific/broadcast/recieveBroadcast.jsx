import React, { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useSocket } from "../socket";
import Videojs from "video.js"
import VideoPlayer from "../videPlayer/LiveVideoPlayer";
import { toast } from "react-toastify";
import { ensureSocketReady } from "../../shared/SharedFun";


export function useMediasoupConsumers(roomId ,socket , isBroadcast = false) {
  const [streams, setStreams] = useState([]);
  const rtcCapabilities = useRef(null);
  const transportRef = useRef(null);
  const deviceRef = useRef(null);
  const consumersRef = useRef(new Map());

  const [chats , setChats] = useState([]) ;

  const init = useCallback(async (videoId , audioId ) => {
    if(!roomId && !isBroadcast) return console.error('Room ID not provided');
    
    if (transportRef.current) {
      transportRef.current?.close(); 
    }
    console.log('init called' , 'videoId' , !!videoId , 'audioId' , !!audioId);
    
   

    try {
      
      await ensureSocketReady(socket);

      // 1. Get RTP capabilities
      console.log('rtp tried' );
      
      socket.emit("getRtpCapabilities", async (routerRtpCapabilities) => {
        const dev = new mediasoupClient.Device();
        await dev.load({ routerRtpCapabilities });
        deviceRef.current = dev;
        rtcCapabilities.current = routerRtpCapabilities;
        console.log('rtp connected');
        
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
          console.log('consumer transport created');
          
          // 3. Fetch producers
          if(!isBroadcast){// broadcast means one way live stream
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
                      
                      consumersRef.current.set(consumer.id , consumer);
                      
                      obj.producers.push({
                        track: consumer.track,
                        producerId,
                        kind,
                        consumer: consumer.id,
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
          }else {
            let obj = {} ;
            console.log(videoId , audioId);
            
            if(videoId){
              socket.emit('consumeStream' ,{
                rtpCapabilities: dev.rtpCapabilities,
                producerId: videoId,
                transportId: transport.id,
              } , async ({ id, producerId, kind, rtpParameters, error }) => {
                if (error) return console.error("Consume error:", error);
                  const consumer = await transport.consume({
                    id , producerId , kind , rtpParameters
                  }) ;
                  console.log(consumer);
                  
                  consumersRef.current.set(consumer.id , consumer);
                  socket.emit("resumeConsumer", { consumerId: id });
                  obj = {
                    track : consumer.track ,
                    id : consumer.id ,
                    producerId ,
                    kind ,
                  }
                  console.log(obj.kind);
                  
                  setStreams([obj])
              })
            }
            if(audioId){
              obj = {} ;
              socket.emit('consumeStream' ,{
                rtpCapabilities: dev.rtpCapabilities,
                producerId: audioId,
                transportId: transport.id,
              } , async ({ id, producerId, kind, rtpParameters, error }) => {
                if (error) return console.error("Consume error:", error);
                  const consumer = await transport.consume({
                    id , producerId , kind , rtpParameters
                  }) ;
                  console.log(consumer);
                  
                  consumersRef.current.set(consumer.id , consumer);
                  socket.emit("resumeConsumer", { consumerId: id , roomId });
                  obj = {
                    track : consumer.track ,
                    id : consumer.id ,
                    producerId ,
                    kind ,
                  }
                  console.log(obj.kind );
                  
                  setStreams(prev => [...prev , obj])
              })
            }
          }
        });
      });
      if(!isBroadcast){
        socket.emit('getAllMessages' , { roomId } , ({chat , error}) => {
        if(error) return toast.error(error);
        setChats(chat);
      }) ;
      }
    } catch (err) {
      console.error("Init error:", err);
    }
  }, [roomId, socket]);

  // ✅Cleanup function
  const cleanup = useCallback(() => {
    // Close all consumers
    consumersRef.current.forEach((c) => {
      try {
        c?.close();
      } catch (e) {}
    });
    consumersRef.current = new Map();

    // Close transport
    if (transportRef.current) {
      try {
        transportRef.current?.close();
      } catch (e) {}
      transportRef.current = null;
    }

    // Clear device + caps
    deviceRef.current = null;
    rtcCapabilities.current = null;

    // Reset state
    setStreams([]);
  }, []);

  // 🧹Run cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);


  useEffect(() => {
    if (!socket) return;
    
     const AddNewUser = async({ user , p : p_ }) => {
      console.log('new User added' , roomId);
      
      for( const p  of p_){
        socket.emit("consume", {
          rtpCapabilities: rtcCapabilities.current,
          producerId: p.id,
          transportId: transportRef.current.id,
          roomId,
        },async ({ id, producerId, kind, rtpParameters , error }) => {
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
          consumersRef.current.set(consumer.id , consumer);
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
            consumersRef.current.get(p.consumer)?.close();
          })
        }
        return prevStreams.filter(s => s.user.userId !== userId)
      });
    };

    const newMessageMeeting = ({ message , roomId : recivedRoomId}) => {
      if(recivedRoomId !== roomId) return ;
      setChats(prev => [
        ...prev , 
        message ,
      ]) ;
      console.log(message);
      
    } 

    socket.on("NewMessageToMeeting" , newMessageMeeting)
    socket.on("removeUserFromMeeting", removeOldUser ) 
    socket.on("NewUserToMeeting", AddNewUser)

    return () => {
      socket.off("removeUserFromMeeting" , removeOldUser);
      socket.off('newMessageMeeting' , newMessageMeeting) ;
      socket.off("NewUserToMeeting" , AddNewUser);

    } 
  } , [socket , init , roomId])

  return { streams, rtcCapabilities, transportRef, init, cleanup , consumersRef , chats};
}

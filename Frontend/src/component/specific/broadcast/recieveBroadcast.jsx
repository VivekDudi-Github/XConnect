import React, { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useSocket } from "../socket";
import Videojs from "video.js"
import VideoPlayer from "../VideoPlayer";


export function useMediasoupConsumers(roomId, socket) {
  console.log(roomId);
  
  const [streams, setStreams] = useState([]);
  const rtcCapabilities = useRef(null);
  const transportRef = useRef(null);
  const deviceRef = useRef(null);
  const consumersRef = useRef([]);

  const init = useCallback(async () => {
    if(!roomId) return console.error('Room ID not provided');
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
    console.log(socket , socket?.id); 
    
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

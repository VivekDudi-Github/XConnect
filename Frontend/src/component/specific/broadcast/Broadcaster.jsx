import React, { useRef, useState, useEffect , useCallback } from "react";
import { Device } from "mediasoup-client";




export function useBroadcast(socket) {
  const localStreamRef = useRef(null);
  const producerTransportRef = useRef(null);
  const producersRef = useRef([]); // all producers (audio + video)
  const deviceRef = useRef(null);

  const [isLive, setIsLive] = useState(false);
  const [videoProducer, setVideoProducer] = useState(null);
  const [audioProducer, setAudioProducer] = useState(null);

  // Start broadcast
  const startBroadcast = useCallback(
    async (cameraOn = true , roomId) => {
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
              setAudioProducer(ap);
            }

            setIsLive(true);
            localStreamRef.current = {
              audioStream: new MediaStream(localStreamRef.current.getAudioTracks()),
              videoStream: new MediaStream(localStreamRef.current.getVideoTracks()),
            };
          });
        });
      } catch (err) {
        console.error("startBroadcast error:", err);
      }
    },
    [socket]
  );

  // Stop broadcast
  const stopBroadcast = useCallback((roomId) => {
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
    if(socket) socket.emit('userLeftFromMeeting' , { roomId });
    console.log("Broadcast stopped");
  }, [socket ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBroadcast();
    };
  }, [stopBroadcast]);

  return {
    isLive,
    videoProducer,
    audioProducer,
    startBroadcast,
    stopBroadcast,
    localStreamRef,
  };
}

  


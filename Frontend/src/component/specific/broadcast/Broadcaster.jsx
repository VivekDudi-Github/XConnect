import React, { useRef, useState, useEffect , useCallback } from "react";
import { Device } from "mediasoup-client";
import { toast } from "react-toastify";
import { GET_RTP_CAPABILITIES , CONNECT_PRODUCER_TRANSPORT , CREATE_WEBRTC_TRANSPORT , PRODUCE , PRODUCE_STREAM } from "../../../constants/mediasoup.socket.constant";
import { USER_LEFT_FROM_MEETING } from "../../../constants/meeting.socket.constant";




export function useBroadcast(socket , isStream = false ) {
  const localStreamRef = useRef(null);
  const producerTransportRef = useRef(null);
  const producersRef = useRef([]); // all producers (audio + video)
  const deviceRef = useRef(null);

  const [isLive, setIsLive] = useState(false);
  const [videoProducer, setVideoProducer] = useState(null);
  const [audioProducer, setAudioProducer] = useState(null);

  // Start broadcast
  const startBroadcast = useCallback(
    async (cameraOn = true , roomId ) => {
      if (!socket) {
        console.error("Socket not connected");
        return;
      }
      if(!isStream && !roomId){
        toast.error('roomId not found')
        return ;
      }

      try {
        // 1) Capture media
        if(cameraOn){
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) ;
        }else {
          let displayMedia = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }) ;
          let micStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true }) ;
          localStreamRef.current = new MediaStream([...displayMedia.getVideoTracks() , ...displayMedia.getAudioTracks() , ...micStream.getAudioTracks() ]) ;
        }
        console.log(cameraOn , localStreamRef.current);
        
        // 2) Get router RTP caps & load device
        socket.emit(GET_RTP_CAPABILITIES, async (routerRtpCapabilities) => {
          const device = new Device();
          await device.load({ routerRtpCapabilities });
          deviceRef.current = device;
          console.log(routerRtpCapabilities , device?.rtpCapabilities);
          

          // 3) Ask server for send transport
          socket.emit(CREATE_WEBRTC_TRANSPORT, async (params) => {
            const producerTransport = device.createSendTransport(params);
            producerTransportRef.current = producerTransport;

            // Transport connect
            producerTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
              socket.emit(
                CONNECT_PRODUCER_TRANSPORT,
                { dtlsParameters, transportId: producerTransport.id },
                () => callback() 
              );
            });

            // Transport produce
            
            producerTransport.on(PRODUCE, async ({ kind, rtpParameters }, callback) => {
              if(!isStream){
                socket.emit( // used for creating live meetings 
                  PRODUCE,
                  { kind, rtpParameters, roomId, transportId: producerTransport.id },
                  ({ id, error }) => {
                    if (error) {
                      console.error("produce error:", error);
                      return;
                    }
                    callback({ id });
                  }
                )
              }else { // used for creating live streams 
                socket.emit(
                  PRODUCE_STREAM ,
                  { kind, rtpParameters, transportId: producerTransport.id },
                  ({ id , error }) => {
                    if(error){
                      console.error('produce_stream error:' , error) ;
                      return ;
                    }
                    callback({ id });
                  }
                )
              }
            })
              
          // 4) Produce tracks
            const videoTrack = localStreamRef.current?.getVideoTracks()[0];
            if (videoTrack) {
              const vp = await producerTransport.produce({
                track: videoTrack,
                encodings: [
                  { rid: "r0", scaleResolutionDownBy: 4, maxBitrate: 300_000 },
                  { rid: "r1", scaleResolutionDownBy: 2, maxBitrate: 900_000 },
                  { rid: "r2", scaleResolutionDownBy: 1, maxBitrate: 2_500_000 },
                ] ,
                codecOptions: {
                  videoGoogleStartBitrate: 1000, 
                },
              });
              producersRef.current.push(vp);
              setVideoProducer(vp);
            }

            const audioTrack = localStreamRef.current?.getAudioTracks()[0];
            if (audioTrack) {
              const ap = await producerTransport.produce({ track: audioTrack });
              producersRef.current.push(ap);
              setAudioProducer(ap);
            }

            setIsLive(true);
            localStreamRef.current = {
              audioStream: new MediaStream(localStreamRef.current?.getAudioTracks()),
              videoStream: new MediaStream(localStreamRef.current?.getVideoTracks()),
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
        if(p) p.close();
      } catch (_) {}
    });
    producersRef.current = [];

    // Close transport
    try {
      producerTransportRef.current?.close();
    } catch (_) {}

    // Stop tracks
    if (localStreamRef.current) {
      localStreamRef?.current?.videoStream?.getTracks()?.forEach((t) => t?.stop());
      localStreamRef?.current?.audioStream?.getTracks()?.forEach((t) => t?.stop());
      localStreamRef.current = null;
    }

    setIsLive(false);
    setVideoProducer(null);
    if(socket) socket.emit(USER_LEFT_FROM_MEETING , { roomId });
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

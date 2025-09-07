import { useRef } from "react";
import { Device } from "mediasoup-client";
import { useParams } from "react-router-dom";
import {useSocket} from "../socket";

function ReceiveBroadcast() {
  const { id: producerId } = useParams(); // producerId passed via route
  const socket = useSocket();
  const videoRef = useRef(null);
  const deviceRef = useRef(null);
  const consumerTransportRef = useRef(null);

  const joinBroadcast = async () => {
    try {
      // 1) Ask server for RTP capabilities
      socket.emit("getRtpCapabilities", async (routerRtpCapabilities) => {
        const device = new Device();
        await device.load({ routerRtpCapabilities });
        deviceRef.current = device;

        // 2) Ask server to create a consumer transport
        socket.emit("createConsumerTransport", async (params) => {
          const consumerTransport = device.createRecvTransport(params);
          console.log('createConsumerTransport created');
          
          consumerTransportRef.current = consumerTransport;

          // Transport DTLS connect
          consumerTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
            console.log('emitted connectConsumerTransport');
            
            socket.emit("connectConsumerTransport", { dtlsParameters , transportId : consumerTransport._id }, () => {
              console.log('connectConsumerTransport connected');
              callback() ;
            }) ;
          });

          // 3) Ask server to consume the given producerId
          console.log('consumerTransport._id : ' ,consumerTransport._id);
          
          socket.emit(
            "consume",
            {
              rtpCapabilities: device.rtpCapabilities,
              producerId, // comes from URL param ,
              transportId : consumerTransport._id
            },
            async ({ id, producerId, kind, rtpParameters }) => {
              const consumer = await consumerTransport.consume({
                id,
                producerId,
                kind,
                rtpParameters,
              });
              
              // 4) Wrap into a MediaStream and attach to <video>
              const stream = new MediaStream([consumer.track]);
              videoRef.current.srcObject = stream;
              console.log(consumer.track.readyState , consumer.track.kind) ;
              
              await consumer.resume();

              // 5) Tell server to resume (start sending)
              socket.emit("resumeConsumer", { consumerId: id });
            }
          );
        });
      });
    } catch (error) {
      console.error("joinBroadcast error:", error);
    }
  };

  return (
    <div>
      <h2>Receive Broadcast</h2>
      <video
        ref={videoRef}
        style={{ width: "640px", height: "360px", }}
        autoPlay
        playsInline
        controls
      />
      <button onClick={joinBroadcast}>Join Broadcast</button>
      <button>Leave Broadcast</button>
    </div>
  );
}

export default ReceiveBroadcast;

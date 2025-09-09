import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useSocket } from "../socket";


const ReceiveBroadcast = () => {
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
        await dev.load({ routerRtpCapabilities });
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
          socket.emit("getProducers", {}, async (producers) => {
            console.log("Available producers:", producers);

            // 4. Consume each producer
            for (const p of producers) {
              socket.emit(
                "consume",
                {
                  rtpCapabilities: dev.rtpCapabilities,
                  producerId: p.id,
                  transportId: transport.id,
                },
                async ({ id, producerId, kind, rtpParameters }) => {
                  const consumer = await transport.consume({
                    id,
                    producerId,
                    kind,
                    rtpParameters,
                  });

                  const stream = new MediaStream([consumer.track]);

                  if (kind === "video") {
                    videoRef.current.srcObject = stream;
                  } else if (kind === "audio") {
                    const audioEl = document.createElement("audio");
                    audioEl.srcObject = stream;
                    audioEl.autoplay = true;
                    document.body.appendChild(audioEl);
                  }

                  await consumer.resume();
                  socket.emit("resumeConsumer", { consumerId: id });
                }
              );
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














// import { useRef , useState } from "react";
// import { Device } from "mediasoup-client";
// import {useSocket} from "../socket";

// function ReceiveBroadcast() {
//   const socket = useSocket();
//   const videoRef = useRef(null);
//   const deviceRef = useRef(null);
//   const consumerTransportRef = useRef(null);

//   const [producerId, setProducerId] = useState("") ;

//   const joinBroadcast = async () => {
//     try {
//       // 1) Ask server for RTP capabilities
//       socket.emit("getRtpCapabilities", async (routerRtpCapabilities) => {
//         const device = new Device();
//         await device.load({ routerRtpCapabilities });
//         deviceRef.current = device;

//         // 2) Ask server to create a consumer transport
//         socket.emit("createConsumerTransport", async (params) => {
//           const consumerTransport = device.createRecvTransport(params);
//           console.log('createConsumerTransport created');
          
//           consumerTransportRef.current = consumerTransport;

//           // Transport DTLS connect
//           consumerTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
//             console.log('emitted connectConsumerTransport');
            
//             socket.emit("connectConsumerTransport", { dtlsParameters , transportId : consumerTransport._id }, () => {
//               console.log('connectConsumerTransport connected' , consumerTransport?.id );
//               callback() ;
//             }) ;
//           });

//           // 3) Ask server to consume the given producerId
//           console.log('consumerTransport._id : ' ,consumerTransport._id);
          
//           socket.emit(
//             "consume",
//             {
//               rtpCapabilities: device.rtpCapabilities,
//               producerId, // comes from URL param ,
//               transportId : consumerTransport._id
//             },
//             async ({ id, producerId, kind, rtpParameters }) => {
//               const consumer = await consumerTransport.consume({
//                 id,
//                 producerId,
//                 kind,
//                 rtpParameters,
//               });
              
//               // 4) Wrap into a MediaStream and attach to <video>
//               const stream = new MediaStream();
//               stream.addTrack(consumer.track);
//               videoRef.current.srcObject = stream;
//               // videoRef.current.play().catch(err => console.warn("Autoplay prevented:", err));
//               console.log(consumer.track.readyState , consumer.getStats , consumer.track.kind) ;
              
//               // await consumer.resume();

//               // 5) Tell server to resume (start sending)
//               socket.emit("resumeConsumer", { consumerId: id });
//             }
//           );
//         });
//       });
//     } catch (error) {
//       console.error("joinBroadcast error:", error);
//     }
//   };

//   return (
//     <div>
//       <h2>Receive Broadcast</h2>
//       <input type="text" className=" m-2 h-8 w-full border border-black" value={producerId} onChange={(e) => setProducerId(e.target.value)} />
//       <video
//         ref={videoRef}
//         style={{ width: "640px", height: "360px", }}
//         autoPlay
//         playsInline
//         controls
//       />

//       <button onClick={joinBroadcast}>Join Broadcast</button>
//       <button>Leave Broadcast</button>
//     </div>
//   );
// }

// export default ReceiveBroadcast;

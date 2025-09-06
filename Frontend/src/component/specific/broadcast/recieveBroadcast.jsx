import React from 'react'

function recieveBroadcast() {

  const joinBroadcast = () => {
    try {
      socket.emit("createWebRtcTransport", async (params) => {
      const consumerTransport = device.createRecvTransport(params);

      consumerTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
        socket.emit("connectConsumerTransport", { dtlsParameters }, () => callback());
      });

      // Now ask server to consume a given producerId
      socket.emit("consume", {
        rtpCapabilities: device.rtpCapabilities,
        producerId: SOME_PRODUCER_ID  // got from "newProducer"
      }, async ({ id, kind, rtpParameters }) => {
        const consumer = await consumerTransport.consume({
          id,
          producerId: SOME_PRODUCER_ID,
          kind,
          rtpParameters
        });

        // Wrap into a MediaStream and play
        const stream = new MediaStream();
        stream.addTrack(consumer.track);

        const video = document.createElement("video");
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;

        document.body.appendChild(video);

        // Tell server to resume (start sending media)
        socket.emit("resumeConsumer", { consumerId: id });
      });
    });

    } catch (error) {
      console.log(error);
      
    }
  }

  return (
    <div>recieveBroadcast</div>
  )
}

export default recieveBroadcast



import { Device } from 'mediasoup-client';
import useSocket from '../socket';

// Create a device (use browser auto-detection).
const device = new Device();
const socket = useSocket();

// Communicate with our server app to retrieve router RTP capabilities.
await socket.emit('getRouterCapabilities' , async(routerRtpCapabilities) => {
    // Load the device with the router RTP capabilities.
  await device.load({ routerRtpCapabilities });
  }
);

// Check whether we can produce video to the router.
if (!device.canProduce('video')) {
	console.warn('cannot produce video');
	// Abort next steps.
}

// Create a transport in the server for sending our media through it.
let  id, iceParameters, iceCandidates, dtlsParameters, sctpParameters  ;
	await socket.emit('createWebRtcTransport' , {
		sctpCapabilities: device.sctpCapabilities,
	} , (data) => {
     id = data.id ;
     iceParameters = data.iceParameters ;
     iceCandidates = data.iceCandidates ;
     dtlsParameters = data.dtlsParameters ;
     sctpParameters = data.sctpParameters ;
  } );

// Create the local representation of our server-side transport.
const sendTransport = device.createSendTransport({
	id,
	iceParameters,
	iceCandidates,
	dtlsParameters,
	sctpParameters,
});

// Set transport "connect" event handler.
sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
	// Here we must communicate our local parameters to our remote transport.
	try {
		await mySignaling.request('transport-connect', {
			transportId: sendTransport.id,
			dtlsParameters,
		});

		// Done in the server, tell our transport.
		callback();
	} catch (error) {
		// Something was wrong in server side.
		console.log(error);
	}
});

// Set transport "produce" event handler.
sendTransport.on(
	'produce',
	async ({ kind, rtpParameters, appData }, callback, errback) => {
		// Here we must communicate our local parameters to our remote transport.
		try {
			const { id } = await mySignaling.request('produce', {
				transportId: sendTransport.id,
				kind,
				rtpParameters,
				appData,
			});

			// Done in the server, pass the response to our transport.
			callback({ id });
		} catch (error) {
			// Something was wrong in server side.
			errback(error);
		}
	}
);

// Set transport "producedata" event handler.
sendTransport.on(
	'producedata',
	async (
		{ sctpStreamParameters, label, protocol, appData },
		callback,
		errback
	) => {
		// Here we must communicate our local parameters to our remote transport.
		try {
			const { id } = await mySignaling.request('produceData', {
				transportId: sendTransport.id,
				sctpStreamParameters,
				label,
				protocol,
				appData,
			});

			// Done in the server, pass the response to our transport.
			callback({ id });
		} catch (error) {
			// Something was wrong in server side.
			errback(error);
		}
	}
);

// Produce our webcam video.
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
const webcamTrack = stream.getVideoTracks()[0];
const webcamProducer = await sendTransport.produce({ track: webcamTrack });

// Produce data (DataChannel).
const dataProducer = await sendTransport.produceData({
	ordered: true,
	label: 'foo',
});
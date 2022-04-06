import {RtpCodecCapability, WebRtcTransportOptions} from "mediasoup/node/lib/types";

export const mediaCodecs: RtpCodecCapability[] = [
    {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
            'x-google-start-bitrate': 1000,
        },
    },
]

export const webRtcTransportOption: WebRtcTransportOptions = {
    listenIps: [
        {
            // my ip?
            // ip: '192.168.178.64', // replace with relevant IP address
            // ip: '127.0.0.1',
            // ip: '172.17.0.2',
            ip: <string>process.env.MEDIASOUP_LISTEN_IP,
            announcedIp: <string>process.env.MEDIASOUP_ANNOUNCED_IP,
            // announcedIp: '127.0.0.1',
            // announcedIp: '10.0.0.115',
        }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
}
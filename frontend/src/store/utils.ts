import {User, UserCoordinates} from "./models";
import default_image from "../rsc/profile.png";
import CameraProcessor from 'camera-processor';
import {
    RENDER_PIPELINE,
    SEGMENTATION_BACKEND,
    SegmentationAnalyzer,
    VIRTUAL_BACKGROUND_TYPE,
    VirtualBackgroundRenderer
} from '@camera-processor/virtual-background';

export function getCookie(cname: string) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function resetCookie(cname: string) {
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = cname + "=;" + expires + ";path=/";
}

export function keycloakUserToUser(data: any, online: boolean, position?: UserCoordinates, video?: boolean): User {
    const image = data.attributes?.profile_image
    return {
        id: data["id"],
        online: online,
        video: (online) ? !!video : false, // bug change to actual state

        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        profile_image: (!!image && data.image !== "") ? image : default_image, // The actual URL to the image if available

        position
    }
}

export function applyVirtualBackground(stream: MediaStream, kind?: string, cameraProcessor?: CameraProcessor): [MediaStream, CameraProcessor?] {
    // Stop everything that was before
    stopAllVideoEffects(cameraProcessor)

    if (!kind || kind === "none" || stream.getVideoTracks().length === 0) {
        return [stream, undefined]
    }

    const camera_processor = new CameraProcessor(); // Instantiate framework object
    camera_processor.setCameraStream(new MediaStream([stream.getVideoTracks()[0].clone()])); // Set the camera stream from somewhere
    camera_processor.start(); // Start the camera processor

    // Add the segmentation analyzer
    const segmentation_analyzer = camera_processor.addAnalyzer(
        'segmentation',
        new SegmentationAnalyzer(SEGMENTATION_BACKEND.MLKit)
    );

    // Add the virtual background renderer
    const background_renderer = camera_processor.addRenderer(new VirtualBackgroundRenderer(RENDER_PIPELINE._2D));


    const hostURL = process.env.PUBLIC_URL
    //const hostURL = "http://localhost"

    if (kind === "blur") {
        // Set the virtual background settings
        background_renderer.setBackground(VIRTUAL_BACKGROUND_TYPE.Filter, 'blur(10px)');
        background_renderer.setRenderSettings({contourFilter: 'blur(4px)'});
    } else if (kind === "color") {
        background_renderer.setBackground(VIRTUAL_BACKGROUND_TYPE.Color, "gray");
    } else if (kind === "transparent") {
        background_renderer.setBackground(VIRTUAL_BACKGROUND_TYPE.Transparent);
    } else if (kind === "image") {
        const image = new Image()
        image.src = URL.createObjectURL("")
        background_renderer.setBackground(VIRTUAL_BACKGROUND_TYPE.Image, image);
    } else if (kind === "yacht") {
        const image = new Image()
        image.src = hostURL + "/rsc/background.jpg"
        background_renderer.setBackground(VIRTUAL_BACKGROUND_TYPE.Image, image);
    }

    // Load the model
    // modelPath is the path where you hosted the model's .tflite file
    // modulePath is the path where you hosted tflite-helper's module files
    segmentation_analyzer.loadModel({
        modelPath: hostURL + '/tflite/models/selfie_segmentation.tflite',
        modulePath: hostURL + '/tflite/'
    });

    const cam = camera_processor.getOutputStream()

    const audioTracks = (stream.getAudioTracks().length === 0) ? [] : stream.getAudioTracks()

    stream.getVideoTracks().forEach(t => {
        stream.removeTrack(t)
        t.stop()
    })

    return [new MediaStream([
        ...audioTracks,
        ...cam.getVideoTracks(),
    ]), camera_processor]; // Get the output stream and use it
}

export function stopAllVideoEffects(cam?: CameraProcessor) {
    cam?.freeCameraStream(true)
    cam?.stop()
}

export function playNotificationSound() {
    const notification = new Audio(process.env.PUBLIC_URL + "/rsc/notification.wav")
    notification.volume = 0.5
    notification.play()
}
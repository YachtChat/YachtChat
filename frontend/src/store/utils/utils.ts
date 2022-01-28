import {User, UserCoordinates} from "../model/model";
import default_image from "../../rsc/profile.png";
import CameraProcessor from 'camera-processor';
import {
    RENDER_PIPELINE,
    SEGMENTATION_BACKEND,
    SegmentationAnalyzer,
    VIRTUAL_BACKGROUND_TYPE,
    VirtualBackgroundRenderer
} from '@camera-processor/virtual-background';
import {AppThunk} from "./store";
import {FRONTEND_URL} from "./config";
import {handleError, handleSuccess} from "../statusSlice";
import {getInvitationToken, getToken} from "../spaceSlice";
import posthog from "posthog-js";
import {destroySession} from "../destroySession";
import {push} from "redux-first-history";
import axios from "axios";

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

export function keycloakUserToUser(data: any, online: boolean, position?: UserCoordinates): User {
    const image = data.attributes?.profile_image
    return {
        id: data["id"],
        online: online,

        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        profile_image: (!!image && data.image !== "") ? image : default_image, // The actual URL to the image if available
        userStream: {video: undefined, audio: undefined, screen: undefined},

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

    // https://github.com/spasimir21/time-worker/blob/main/src/

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
        //image.src = URL.createObjectURL("")
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

export function convertRemToPixels(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function isElectron() {
    // Renderer process
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        return true;
    }

    // Main process
    // @ts-ignore
    if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions["electron"]) {
        return true;
    }

    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
    }

    return false;
}

export function isWindows() {
    return navigator.platform.indexOf('Win') > -1
}

function isOS() {
    return navigator.userAgent.match(/ipad|iphone/i);
}

export const copyToClipboard = (message: string): Promise<void> => {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(message)
    } else if (document.execCommand) {
        const textArea = document.createElement('input') as HTMLInputElement;
        textArea.value = message
        document.body.appendChild(textArea);

        if (!isOS()) {
            const range = document.createRange();
            range.selectNodeContents(textArea);
            const selection = window.getSelection();
            selection!.removeAllRanges();
            selection!.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }

        return new Promise<void>((resolve, reject) => {
            const success = document.execCommand('copy', true, "message")
            document.body.removeChild(textArea);
            if (!success) {
                reject()
                return
            }
            resolve()
        })
    } else {
        return new Promise<void>((resolve, reject) => {
            reject()
        })
    }
}


export const copyInviteLink = (spaceID: string): AppThunk => (dispatch, getState) => {
    function tokenToLink(inviteToken: string) {
        copyToClipboard("https://" + FRONTEND_URL + "/join/" + inviteToken).then(() => {
            dispatch(handleSuccess("Successfully copied invite link."))
            posthog.capture("Invite link copied")
        }).catch((e) => {
            dispatch(handleError("Could not copy invite link", e))
            dispatch(push("/invite/" + spaceID))
            dispatch(destroySession())
        })
    }

    const token = getToken(getState(), spaceID)

    if (!token) {
        getInvitationToken(getState(), spaceID).then(inviteToken => {
            tokenToLink(inviteToken)
        }).catch(() => dispatch(handleError("Unable to request token")))
    } else {
        tokenToLink(token)
    }
}

export function isOnline(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!navigator.onLine) {
            // If it has no connection at all
            reject()
            return
        }
        axios.get("https://www.yacht.chat").then(() => {
            // If connection to homepage could be established
            resolve()
        }).catch(() => {
            // No connection? Homepage down?
            axios.get("https://" + FRONTEND_URL).then(() => {
                // Test
                resolve()
            }).catch(() => {
                reject()
            })
        })
    })
}
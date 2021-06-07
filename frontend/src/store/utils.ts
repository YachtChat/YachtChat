import {User, UserCoordinates} from "./models";
import default_image from "../rsc/profile.png"

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
    document.cookie = cname + "=" + ";" + expires + ";path=/";
}

export function keycloakUserToUser(data: any, online: boolean, position?: UserCoordinates): User {
    const image = data["attributes"]["profile_image"]
    return {
        id: data["id"],
        online: online,

        firstName: data["firstName"],
        lastName: data["lastName"],
        username: data["username"],
        email: data["email"],
        profile_image: (!!image && data.image != "") ? image : default_image, // The actual URL to the image if available

        image: false,

        position
    }
}
import {handleSuccess} from "../statusSlice";
import {AppThunk} from "./store";

const notifications: Notification[] = []

export const requestNotifications = (): AppThunk => dispatch => {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
        console.log("This browser does not support notifications.");
    } else {
        if (checkNotificationPromise()) {
            Notification.requestPermission()
                .then((permission) => {
                    if (permission === "granted")
                        dispatch(handleSuccess("Notification enabled"))
                })
        } else {
            Notification.requestPermission(function (permission) {
                if (permission === "granted")
                    dispatch(handleSuccess("Notification enabled"))
            });
        }
    }
}

function checkNotificationPromise() {
    try {
        Notification.requestPermission().then();
    } catch (e) {
        return false;
    }

    return true;
}

export function sendNotification(m: string, pic?: string) {
    if (window.Notification && Notification.permission === "granted") {
        notifications.push(new Notification("Yacht.Chat", { body: m, icon: pic }))
    }
}

export function clearAllNotifications() {
    notifications.forEach(n => {
        n.close()
    })
}
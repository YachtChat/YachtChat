import {handleError, handleSuccess} from "../statusSlice";
import {AppThunk, RootState} from "./store";
import {setNotifications} from "../playgroundSlice";

const notifications: Notification[] = []

export const requestNotifications = (): AppThunk => dispatch => {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
        console.log("This browser does not support notifications.");
        dispatch(handleError("This browser does not support notifications."))
    } else {
        if (checkNotificationPromise()) {
            Notification.requestPermission()
                .then((permission) => {
                    if (permission === "granted") {
                        dispatch(handleSuccess("Notification enabled"))
                        dispatch(setNotifications(true))
                    }
                })
        } else {
            Notification.requestPermission(function (permission) {
                if (permission === "granted") {
                    dispatch(handleSuccess("Notification enabled"))
                    dispatch(setNotifications(true))
                }
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

export function sendNotification(state: RootState, m: string, pic?: string, onClick?: (this: Notification, ev: Event) => void) {
    if (state.playground.notifications && window.Notification && Notification.permission === "granted") {
        const n = new Notification("Yacht.Chat", {body: m, icon: pic})
        notifications.push(n)
        n.onclick = onClick ?? null
    }
}

export function clearAllNotifications() {
    notifications.forEach(n => {
        n.close()
    })
}
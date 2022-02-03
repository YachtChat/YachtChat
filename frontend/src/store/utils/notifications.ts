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

export function sendNotification(state: RootState, m: string, pic?: string,
                                 // Actions are currently not supported
                                 // actions?: NotificationClickAction[]
) {
    const actions: NotificationClickAction[] | undefined = undefined
    function actionClick(this: Notification, ev: Event) {

        actions!.forEach(a => {
            // @ts-ignore
            if (ev.action === a.action) a.onClick()
        })
    }

    if (state.playground.notifications && window.Notification && Notification.permission === "granted") {
        const n = new Notification("Yacht.Chat", {body: m, icon: pic, actions: actions})
        notifications.push(n)

        n.onclick = () => {
            window.focus()
            n.close()
        }

        // n.onclick = !!actions ? actionClick : null
    }
}

export function clearAllNotifications() {
    notifications.forEach(n => {
        n.close()
    })
}

interface NotificationClickAction extends NotificationAction {
    onClick: () => void
}
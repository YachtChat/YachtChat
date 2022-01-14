import posthog from "posthog-js";
import {User} from "../model/model";

export function identifyUser(user: User) {
    posthog.identify(
        user.email,
        {},
        {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }
    )
}
import posthog from "posthog-js";
import {User} from "./models";

export function identifyUser(user: User) {
    posthog.identify(
        user.id,
        {},
        {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }
    )
}
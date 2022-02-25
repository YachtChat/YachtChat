import {isValidHttpUrl} from "./utils";

export function parseLinks(m: string) {
    return m.split(" ").map(sub => isValidHttpUrl(sub) ?
        <a className={"clickable ph-no-capture"}
           target="_blank" rel="noopener noreferrer"
           href={sub}>{(sub.length > 30) ? sub.substring(0, 30) + "..." : sub}{" "}</a> :
        sub + " "
    )
}
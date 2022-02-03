import {useState} from "react";

interface Props {
    stream: MediaStream | undefined
    className?: string
    onClick?: () => void
}

export function Video(props: Props) {
    const [id, setID] = useState("")

    return <div onClick={props.onClick} className={props.className}>
        <video

            autoPlay muted
            playsInline
            className={"video"}
            ref={r => {
                if (r && !r.srcObject && id !== props.stream?.id) {
                    r.srcObject = props.stream ?? null
                    setID(props.stream?.id ?? "")
                }
            }}/>
    </div>
}
import "./style.scss"

export function About() {
    return (
        <div id={"about"}>
            <div className={'backgroundBall'}/>
            <svg className={"separator"} width="100%" height="100%" viewBox="0 0 1181 178" version="1.1"
                 style={{fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2}}>
                <g transform="matrix(0.268213,0,0,0.268213,546.275,557.46)">
                    <circle cx="168" cy="2233" r="4256" style={{fill: "white"}}/>
                </g>
            </svg>
            <div className={"contentWrapper"}>

                <div className={"divider"}>
                    <div className={"content"}>
                        <h2>But what is Yacht?
                        </h2>
                        <p>
                            {"Yacht.chat is a digital communication platform that enables real-time #collaboration for #remoteworking teams. Unlike existing communication solutions, Yacht allows each team member to move around freely in a virtual space and adjust their speaking radius. Conversations can thus easily emerge and adapt to team dynamics - comparable to working in an office. Yacht combines the collaborative working methods of an #office with the advantages of #remotework."}
                        </p>
                    </div>
                </div>
                <div className={"youtubeWrapper"}>
                    <div className={"youtube"}>
                        <iframe src="https://www.youtube.com/embed/CN1HuE_Yalo"
                                title="YouTube video player" frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen/>
                    </div>
                </div>
            </div>
        </div>
    )
}
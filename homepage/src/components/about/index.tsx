import "./style.scss"

export function About() {
    return (
        <div id={"about"}>
            <div className={'backgroundBall'}/>
            <div className={"divider"}>
                <div className={"content"}>
                    <h2>But what is Yacht?
                    </h2>
                    <p>
                        {"Yacht.chat is a digital communication platform that enables real-time #collaboration for #remoteworking teams. Unlike existing communication solutions, Yacht allows each team member to move around freely in a virtual space and adjust their speaking radius. Conversations can thus easily emerge and adapt to team dynamics - comparable to working in an office. Yacht combines the collaborative working methods of an #office with the advantages of #remotework."}
                    </p>
                </div>
            </div>
            <div className={"youtube"}>
                <iframe src="https://www.youtube.com/embed/CN1HuE_Yalo"
                        title="YouTube video player" frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen/>
            </div>
        </div>
    )
}
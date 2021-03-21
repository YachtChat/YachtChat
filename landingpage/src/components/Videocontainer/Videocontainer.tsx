import React from 'react';
import './Videocontainer.scss';

const Videocontainer: React.FC = () => (
    <figure className="video">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/IqX9Gi05ZuQ" title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen></iframe>

    </figure>

);

export default Videocontainer;

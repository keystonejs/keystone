import React from 'react';

const EventItem = ({ name, startDate, talks }) => (
	<li>
        <h2>{name}</h2>                
        <p>{startDate}</p>
        <h2>Talks</h2>
        {talks.map((talk, i) => (
            <div key={i}>
                <h3>{talk.name}</h3>
                <h3>Speakers</h3>
                {talk.speakers.map((speaker, j) => (
                    <p key={`speaker-${j}`}>{speaker.name}</p>
                ))}
            </div>
        ))}              
    </li>
);

export default EventItem;
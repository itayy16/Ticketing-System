import React from 'react'
import {Ticket as TicketType} from './api';

type ticketType = {ticket: TicketType, 
    hide: boolean,
    onHide: any,
};

const Ticket = ({ticket, hide, onHide}: ticketType) => {

    const renderLabel = (labels?: string[]) => {

        const l = labels ? labels : [];
		return (<div className='labels'>
			{l.map((label) => (<button className='label'>{label}</button>))}
		</div>);
	}
    
    return (<li key={ticket.id} className={`ticket ${hide && 'hide'}`}>
    <button className='hideButton'onClick={onHide}>Hide</button>
    <h5 className='title'>{ticket.title}</h5>
    <span className='content'> {ticket.content} </span>
    <footer>
        <div className='meta-data'>By {ticket.userEmail} | { new Date(ticket.creationTime).toLocaleString()}</div>
        {renderLabel(ticket.labels)}
    </footer>
</li>)
} 

export default Ticket
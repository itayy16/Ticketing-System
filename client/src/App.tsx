import React from 'react';
import './App.scss';
import {createApiClient, Ticket as ticketType} from './api';
import Ticket from './Ticket';

export type AppState = {
	tickets?: ticketType[],
	search: string,
	hiddenIds: number[];
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		hiddenIds: []
		
	}

	searchDebounce: any = null;

	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets()
		});
	}

	onHide = (index: number) => {
		const newIds = [...this.state.hiddenIds,index];
		this.setState({hiddenIds: newIds})

	}

	renderTickets = (tickets: ticketType[]) => {
		const filteredTickets = tickets
		
			.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()));

		return (<ul className='tickets'>
			{filteredTickets.map((ticket, index) => (<Ticket ticket={ticket} hide={this.state.hiddenIds.includes(index)} onHide={() => this.onHide(index)}/>))
			}
		</ul>);
	}

	onSearch = async (val: string, newPage?: number) => {
		
		clearTimeout(this.searchDebounce);

		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	}
	
	restoreHide = () => {
		this.setState({hiddenIds: []})
	}

	render() {	
		const {tickets} = this.state;
		const hiddenTickets = this.state.hiddenIds.length <= 1 ? 'ticket' : 'tickets';

		return (<main>
			<h1>Tickets List</h1>
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			<span>
				{tickets ? 
					<div className='results'>Showing {tickets.length} results 
						{this.state.hiddenIds.length !== 0 ?
							<span> ({this.state.hiddenIds.length} hidden {hiddenTickets} - 
								<a onClick={this.restoreHide}> restore</a>)
							</span> : null}
					</div> : null }	
			</span>
			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
		</main>)
	}
}

export default App;
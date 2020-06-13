import React from 'react';
import './App.scss';
import {createApiClient, Ticket as ticketType} from './api';
import Ticket from './Ticket';
import debounce from "lodash.debounce";


export type AppState = {
	tickets?: ticketType[],
	search: string,
	hiddenIds: number[],
	page: number;
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		hiddenIds: [],
		page: 0
	}

	searchDebounce: any = null;

	async componentDidMount() {
		this.setState({
			tickets: await this.fetchNextPageTickets()
		})
	}

	fetchNextPageTickets = async () => {
		let nextPage = this.state.page + 1;
		this.setState({page: nextPage})
		return await api.getTickets(this.state.search, nextPage)
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
				search: val,
				tickets: await api.getTickets(val,1)
			});
		}, 300);
	}
	
	restoreHide = () => {
		this.setState({hiddenIds: []})
	}

	
	loadMoreTickets = async () => {
		let currentTickets = this.state.tickets || []
		let nextPageTickets = await this.fetchNextPageTickets()
		this.setState({
			tickets: [...currentTickets, ...nextPageTickets]
		})
	}

	render() {	
		const {tickets} = this.state;
		const hiddenTickets = this.state.hiddenIds.length <= 1 ? 'ticket' : 'tickets';

		window.onscroll = debounce(() => {
			if (window.innerHeight + document.documentElement.scrollTop
			>= document.documentElement.offsetHeight - 2 * 200
			) {
			  this.loadMoreTickets()
			}
		  }, 100);

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
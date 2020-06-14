import React from 'react'
import './App.scss'
import { createApiClient, Ticket as ticketType } from './api'
import Ticket from './Ticket'
import debounce from 'lodash.debounce'

export type AppState = {
    tickets?: ticketType[]
    search: string
    hiddenIds: number[]
    page: number
    sortOrder: number
    sortBy: keyof ticketType
}

const api = createApiClient()

export class App extends React.PureComponent<{}, AppState> {
    state: AppState = {
        search: '',
        hiddenIds: [],
        page: 0,
        sortOrder: 1,
        sortBy: 'id',
    }

    searchDebounce: any = null

    async componentDidMount() {
        this.setState({
            tickets: await this.fetchNextPageTickets(),
        })

        window.onscroll = debounce(() => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 2 * 200
            ) {
                this.loadMoreTickets()
            }
        }, 100)
    }

    fetchNextPageTickets = async () => {
        let nextPage = this.state.page + 1
        this.setState({ page: nextPage })
        return await api.getTickets(this.state.search, nextPage)
    }

    onHide = (index: number) => {
        const newIds = [...this.state.hiddenIds, index]
        this.setState({ hiddenIds: newIds })
    }

    renderTickets = (tickets: ticketType[]) => {
        const filteredTickets = tickets.filter((t) =>
            (t.title.toLowerCase() + t.content.toLowerCase()).includes(
                this.state.search.toLowerCase()
            )
        )

        return (
            <ul className="tickets">
                {filteredTickets.map((ticket, index) => (
                    <Ticket
                        ticket={ticket}
                        hide={this.state.hiddenIds.includes(index)}
                        onHide={() => this.onHide(index)}
                    />
                ))}
            </ul>
        )
    }

    onSearch = async (val: string, newPage?: number) => {
        clearTimeout(this.searchDebounce)
        this.searchDebounce = setTimeout(async () => {
            this.setState({
                search: val,
                tickets: await api.getTickets(val, this.state.page),
            })
        }, 300)
    }

    restoreHide = () => {
        this.setState({ hiddenIds: [] })
    }

    loadMoreTickets = async () => {
        let currentTickets = this.state.tickets || []
        let nextPageTickets = await this.fetchNextPageTickets()
        this.setState({
            tickets: [...currentTickets, ...nextPageTickets],
        })
    }

    sortFunc = (prop: keyof ticketType) => {
        const { tickets } = this.state
        if (tickets) {
            const sortOrder =
                this.state.sortBy === prop ? this.state.sortOrder * -1 : 1
            tickets.sort(function (a: ticketType, b: ticketType) {
                if (prop === 'labels') return -1
                var result = a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0
                return result * sortOrder
            })
            this.setState({
                tickets: [...tickets],
                sortOrder: sortOrder,
                sortBy: prop,
            })
        }
    }

    handleChange = async (event: any) => {
        this.sortFunc(event.target.value)
        await this.setState({
            sortBy: event.target.value,
        })
    }

    render() {
        const { tickets } = this.state
        const hiddenTickets =
            this.state.hiddenIds.length <= 1 ? 'ticket' : 'tickets'

        return (
            <main>
                <h1>Tickets List</h1>
                <header>
                    <input
                        type="search"
                        placeholder="Search..."
                        onChange={(e) => this.onSearch(e.target.value)}
                    />
                </header>
                <div></div>
                <span>
                    {tickets ? (
                        <div className="results">
                            Showing {tickets.length} results
                            {this.state.hiddenIds.length !== 0 ? (
                                <span>
                                    {' '}
                                    ({this.state.hiddenIds.length} hidden{' '}
                                    {hiddenTickets} -
                                    <a onClick={this.restoreHide}> restore</a>)
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                    <select className="sortButton" onChange={this.handleChange}>
                        <option value="">Choose option</option>
                        <option value="creationTime">
                            Creation Time: First to Last
                        </option>
                        <option value="creationTime">
                            Creation Time: Last to First
                        </option>
                        <option value="title">Title: A to Z </option>
                        <option value="title">Title: Z to A</option>
                    </select>
                    <text className="sortBy">Sort by:</text>
                </span>
                {tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
            </main>
        )
    }
}

export default App

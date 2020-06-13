import axios from 'axios';

export type Ticket = {
	id: string,
	title: string;
	content: string;
	creationTime: number;
	userEmail: string;
	labels?: string[];
}

export type ApiClient = {
	getTickets: (value: string, page: number) => Promise<Ticket[]>;
}

export const createApiClient = (): ApiClient => {
	return {
		getTickets: (value: string = '', page: number = 1) => {
			return axios.get(`http://localhost:3232/api/tickets?search=${value}&page=${page}`).then((res) => res.data);
		}
	}
}
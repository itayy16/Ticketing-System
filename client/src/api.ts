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
	getTickets: (value: string) => Promise<Ticket[]>;
}

export const createApiClient = (): ApiClient => {
	return {
		getTickets: (value :string) => {
			return axios.get(`http://localhost:3232/api/tickets?search=${value}`).then((res) => res.data);
		}
	}
}
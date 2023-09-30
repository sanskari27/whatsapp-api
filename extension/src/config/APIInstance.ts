import axios from 'axios';
import { SERVER_URL } from './const';
import { getChromeData, getClientID } from '../utils/ChromeUtils';
import { logout } from '../hooks/useAuth';

const APIInstance = axios.create({
	baseURL: SERVER_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

APIInstance.interceptors.request.use(async (request) => {
	const client_id = await getClientID();
	if (client_id) {
		request.headers['client-id'] = client_id;
	}
	return request;
});
APIInstance.interceptors.response.use(
	async (response) => response,
	async (error) => {
		if (error.response?.data?.error?.title === 'SESSION_INVALIDATED') {
			logout();
		}

		return Promise.reject(error);
	}
);

export default APIInstance;

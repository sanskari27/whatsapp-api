import axios from 'axios';
import { logout } from '../hooks/useAuth';
import { networkError } from '../hooks/useNetwork';
import { getClientID } from '../utils/ChromeUtils';
import { SERVER_URL } from './const';

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
		if (!axios.isAxiosError(error)) return Promise.reject(error);

		if (error.code === 'ERR_NETWORK') {
			networkError();
			return Promise.reject(error);
		}

		if (error.response?.data?.error?.title === 'SESSION_INVALIDATED') {
			logout();
		}

		return Promise.reject(error);
	}
);

export default APIInstance;

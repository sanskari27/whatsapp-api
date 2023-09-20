import axios from 'axios';
import { SERVER_URL } from './const';

const APIInstance = axios.create({
	baseURL: SERVER_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

APIInstance.interceptors.response.use(
	async (response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (getStatus(error) in [401, 404] && !originalRequest._retry) {
			if (error.response.data.error.title === 'SESSION_INVALIDATED') {
				window.location.href = '/';
			}
		}

		return Promise.reject(error);
	}
);

const getStatus = (error: any) => {
	if (error && error.response) {
		return error.response.status;
	}
	return 0;
};

export default APIInstance;

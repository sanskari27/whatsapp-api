import axios from 'axios';
import { SERVER_URL } from '../utils/const';

const APIInstance = axios.create({
	baseURL: SERVER_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

export default APIInstance;

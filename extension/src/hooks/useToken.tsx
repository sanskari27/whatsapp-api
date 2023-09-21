import { useState } from 'react';
import TokenService from '../services/token.service';

export default function useToken() {
	const [isLoading, setLoading] = useState(false);
	const [tokenVerified, setTokenVerified] = useState(localStorage.getItem('token') ? true : false);
	const verifyToken = (token: string, cb: (err: boolean) => void) => {
		setLoading(true);
		TokenService.validateToken(token)
			.then((res) => {
				setLoading(false);
				setTokenVerified(res);
				if (!res) {
					cb(true);
					localStorage.removeItem('token');
				} else {
					localStorage.setItem('token', token);
				}
			})
			.catch(() => {
				setLoading(false);
				cb(true);
			});
	};

	return { tokenVerified, verifyToken, isLoading };
}

import { useEffect, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import AuthService from '../services/auth.service';

const initStatus = {
	isAuthenticated: false,
	isAuthenticating: false,
	isValidating: false,
};
let globalSet: React.Dispatch<
	React.SetStateAction<{
		isAuthenticated: boolean;
		isAuthenticating: boolean;
		isValidating: boolean;
	}>
> = () => {
	throw new Error('you must useAuth before setting its state');
};

export const useAuth = singletonHook(initStatus, () => {
	const [auth, setAuth] = useState(initStatus);
	globalSet = setAuth;

	useEffect(() => {
		const checkAuthStatus = async () => {
			setAuth((prev) => ({ ...prev, isValidating: true }));
			const session_active = await AuthService.isAuthenticated();
			if (session_active) {
				setAuth({
					isAuthenticating: false,
					isAuthenticated: true,
					isValidating: false,
				});
			} else {
				setAuth({
					isAuthenticating: false,
					isAuthenticated: false,
					isValidating: false,
				});
			}
		};

		checkAuthStatus();
	}, []);

	return {
		isAuthenticated: auth.isAuthenticated,
		isAuthenticating: auth.isAuthenticating,
		isValidating: auth.isValidating,
	};
});

export const setAuth = (data: Partial<typeof initStatus>) =>
	globalSet((prev) => ({ ...prev, ...data }));

export const startAuth = async (username: string, password: string) => {
	setAuth({
		isAuthenticating: true,
		isAuthenticated: false,
		isValidating: false,
	});
	const isSuccess = await AuthService.login(username, password);
	setAuth({
		isAuthenticating: false,
		isAuthenticated: isSuccess,
		isValidating: false,
	});
	return isSuccess;
};

export const isUsernameAvailable = async (username: string) => {
	setAuth({
		isAuthenticating: true,
		isAuthenticated: false,
		isValidating: false,
	});
	const available = await AuthService.isUsernameAvailable(username);

	return available;
};

export const createUser = async (data: {
	username: string;
	password: string;
	name: string;
	phone: string;
}) => {
	setAuth({
		isAuthenticating: true,
		isAuthenticated: false,
		isValidating: false,
	});
	const [isSuccess, errorMessage] = await AuthService.create(data);
	setAuth({
		isAuthenticating: false,
		isAuthenticated: isSuccess,
		isValidating: false,
	});

	return errorMessage;
};

export const logout = async () => {
	setAuth({
		isAuthenticating: true,
		isAuthenticated: false,
		isValidating: false,
	});

	await AuthService.logout();
	setAuth({
		isAuthenticating: false,
		isAuthenticated: false,
		isValidating: false,
	});
};

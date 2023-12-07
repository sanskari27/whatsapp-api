import { useEffect, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import { io } from 'socket.io-client';
import { SERVER_URL, SOCKET_EVENT } from '../config/const';
import AuthService from '../services/auth.service';
import { getClientID, saveClientID } from '../utils/ChromeUtils';

const socket = io(SERVER_URL);

const initStatus = {
	isAuthenticated: false,
	isAuthenticating: false,
	qrCode: '',
	qrGenerated: false,
	isSocketInitialized: false,
};
let globalSet: React.Dispatch<
	React.SetStateAction<{
		isAuthenticated: boolean;
		isAuthenticating: boolean;
		qrCode: string;
		qrGenerated: boolean;
		isSocketInitialized: boolean;
	}>
> = () => {
	throw new Error('you must useAuth before setting its state');
};

export const useAuth = singletonHook(initStatus, () => {
	const [auth, setAuth] = useState(initStatus);
	globalSet = setAuth;

	useEffect(() => {
		const checkAuthStatus = async () => {
			setAuth((prev) => ({ ...prev, isAuthenticating: true }));
			const isAuthenticated = await AuthService.isAuthenticated();
			if (isAuthenticated) {
				startAuth();
			} else {
				setAuth((prev) => ({
					...prev,
					isAuthenticating: false,
					isAuthenticated: false,
				}));
			}
		};
		checkAuthStatus();
	}, []);

	return {
		isAuthenticated: auth.isAuthenticated,
		isAuthenticating: auth.isAuthenticating,
		qrCode: auth.qrCode,
		qrGenerated: auth.qrGenerated,
		isSocketInitialized: auth.isSocketInitialized,
	};
});

export const setAuth = (data: Partial<typeof initStatus>) =>
	globalSet((prev) => ({ ...prev, ...data }));

socket.on(SOCKET_EVENT.INITIALIZED, (...args) => {
	saveClientID(args[0]);
});

socket.on(SOCKET_EVENT.WHATSAPP_READY, () => {
	setAuth({
		isAuthenticated: true,
		isAuthenticating: false,
		qrCode: '',
		qrGenerated: false,
		isSocketInitialized: true,
	});
});

socket.on(SOCKET_EVENT.WHATSAPP_AUTHENTICATED, () => {
	setAuth({
		isAuthenticated: true,
		isAuthenticating: false,
		qrCode: '',
		qrGenerated: false,
		isSocketInitialized: false,
	});
});

socket.on(SOCKET_EVENT.WHATSAPP_CLOSED, () => {
	setAuth({
		isAuthenticated: false,
		isAuthenticating: false,
		qrCode: '',
		qrGenerated: false,
	});
	saveClientID('');
});

socket.on(SOCKET_EVENT.QR_GENERATED, (...args) => {
	setAuth({
		qrCode: args[0],
		isAuthenticating: true,
		qrGenerated: true,
		isSocketInitialized: false,
		isAuthenticated: false,
	});
});

export const startAuth = async () => {
	setAuth({
		isAuthenticating: true,
		qrGenerated: false,
		isSocketInitialized: false,
		isAuthenticated: false,
		qrCode: '',
	});
	const client_id = await getClientID();
	socket.emit(SOCKET_EVENT.INITIALIZE, client_id);
};

export const logout = async () => {
	setAuth({
		isAuthenticating: true,
		qrGenerated: false,
		isSocketInitialized: false,
		isAuthenticated: false,
		qrCode: '',
	});

	await AuthService.logout();
	setAuth({
		isAuthenticating: false,
		qrGenerated: false,
		isSocketInitialized: false,
		isAuthenticated: false,
		qrCode: '',
	});
};

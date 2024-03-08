import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SERVER_URL, SOCKET_EVENT } from '../config/const';
import AuthService from '../services/auth.service';

type Status = 'UNINITIALIZED' | 'INITIALIZED' | 'AUTHENTICATED' | 'READY' | 'QR_GENERATED';

export default function useProfile() {
	const socket_ref = useRef(io(SERVER_URL + 'add-device'));

	const [status, setStatus] = useState<Status>('UNINITIALIZED');
	const [qrCode, setQR] = useState('');
	const [error, setError] = useState('');

	const isAuthenticating = status !== 'UNINITIALIZED';

	async function addDevice() {
		if (isAuthenticating) return;
		const client_id = await AuthService.addDevice();
		if (!client_id) {
			setStatus('UNINITIALIZED');
			setError('Cannot add more profiles.');
			return false;
		}
		socket_ref.current.emit(SOCKET_EVENT.INITIALIZE, client_id);
		return true;
	}

	useEffect(() => {
		const socket = socket_ref.current;

		function onInitialized() {
			setStatus('INITIALIZED');
			setQR('');
		}

		function onWhatsappReady() {
			setStatus('READY');
			setQR('');
		}

		function onWhatsappAuthenticated() {
			setStatus('AUTHENTICATED');
			setQR('');
		}

		function onQR(...args: string[]) {
			setStatus('QR_GENERATED');
			setQR(args[0]);
		}

		function onDisconnect() {
			setStatus('UNINITIALIZED');
			setQR('');
			setError('Error Authenticating');
		}

		socket.on(SOCKET_EVENT.INITIALIZED, onInitialized);
		socket.on(SOCKET_EVENT.WHATSAPP_READY, onWhatsappReady);
		socket.on(SOCKET_EVENT.WHATSAPP_AUTHENTICATED, onWhatsappAuthenticated);
		socket.on(SOCKET_EVENT.QR_GENERATED, onQR);
		socket.on('disconnect', onDisconnect);

		return () => {
			socket.off(SOCKET_EVENT.INITIALIZED, onInitialized);
			socket.off(SOCKET_EVENT.WHATSAPP_READY, onWhatsappReady);
			socket.off(SOCKET_EVENT.WHATSAPP_AUTHENTICATED, onWhatsappAuthenticated);
			socket.off(SOCKET_EVENT.QR_GENERATED, onQR);
			socket.off('disconnect', onDisconnect);
		};
	}, [socket_ref]);

	return {
		isAuthenticating,
		status,
		qrCode,
		error,
		addDevice,
	};
}

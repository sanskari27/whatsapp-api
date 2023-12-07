import axios from 'axios';
import { useEffect, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import { SERVER_URL } from '../config/const';

type InitialStatusType = 'RUNNING' | 'NO-NETWORK';
const initStatus: InitialStatusType = 'RUNNING';
let globalSet: any = () => {
	throw new Error('you must useNetwork before setting its state');
};

export const useNetwork = singletonHook(initStatus, () => {
	const [status, setStatus] = useState<'RUNNING' | 'NO-NETWORK'>(initStatus);
	globalSet = setStatus;

	useEffect(() => {
		checkNetwork().then((res) => {
			if (res) {
				setNetworkStatus('RUNNING');
			} else {
				setNetworkStatus('NO-NETWORK');
			}
		});
	}, []);

	return status;
});

function checkNetwork() {
	return new Promise((resolve: (status: boolean) => void) => {
		axios
			.get(SERVER_URL + 'api-status')
			.then((data) => resolve(true))
			.catch(() => resolve(false));
	});
}

export const setNetworkStatus = (data: InitialStatusType) => globalSet(data);

export const recheckNetwork = async () => {
	checkNetwork().then((res) => {
		if (res) {
			setNetworkStatus('RUNNING');
		} else {
			setNetworkStatus('NO-NETWORK');
		}
	});
};
export const networkFound = async () => {
	setNetworkStatus('RUNNING');
};

export const networkError = async () => {
	setNetworkStatus('NO-NETWORK');
};

export function saveClientID(data: string) {
	localStorage.setItem('client_id', data);
}

export function getClientID() {
	return localStorage.getItem('client_id') ?? '';
}

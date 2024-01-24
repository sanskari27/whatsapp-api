export default interface IServerError {
	STATUS: number;
	TITLE: string;
	MESSAGE: string;
}

export type IAPIError = IServerError;

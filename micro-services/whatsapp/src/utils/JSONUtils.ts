export type StringMap = string | string[];

export type JSONObject = {
	[key: string]: StringMap | JSONObject;
};

function getJSON(str: unknown) {
	try {
		const json = JSON.parse(str as string);
		return [
			true,
			{
				action: json.action as string,
				client_id: json.client_id as string,
				...json,
			},
		] as [
			true,
			JSONObject & {
				action: string;
				client_id: string;
			}
		];
	} catch (e) {
		return [false, null] as [false, null];
	}
}

const JSONUtils = {
	getJSON,
};
export default JSONUtils;

import APIInstance from '../config/APIInstance';

export default class LabelService {
	static async listLabels() {
		return new Promise(
			(
				resolve: (
					data: {
						id: string;
						name: string;
					}[]
				) => void,
				reject
			) => {
				APIInstance.get(`/labels`)
					.then(({ data }) => {
						resolve(
							data.labels as {
								id: string;
								name: string;
							}[]
						);
					})
					.catch((err) => {
						if (err?.response?.data?.title === 'BUSINESS_ACCOUNT_REQUIRED') {
							reject('BUSINESS_ACCOUNT_REQUIRED');
							return;
						}
						resolve([]);
					});
			}
		);
	}
	static async fetchLabel(ids: string[]) {
		try {
			const { data } = await APIInstance.get(`/labels/export?label_ids=${ids.join(',')}`);
			return data.entries as {
				name: string;
				number: string;
				country: string;
				isBusiness: string;
				public_name: string;
				label: string;
				group_name: string;
			}[];
		} catch (err) {
			return [];
		}
	}
}

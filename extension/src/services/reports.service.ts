import APIInstance from '../config/APIInstance';

export default class ReportsService {
	static async generateAllCampaigns() {
		try {
			const { data: response } = await APIInstance.get(`/reports/campaign`);

			return response.report as {
				campaign_id: string;
				campaignName: string;
				sent: number;
				failed: number;
				pending: number;
				isPaused: boolean;
			}[];
		} catch (err) {
			return [];
		}
	}
	static async pauseCampaign(id: string) {
		try {
			await APIInstance.post(`/reports/campaign/${id}/pause`);
		} catch (err) {}
	}
	static async resumeCampaign(id: string) {
		try {
			await APIInstance.post(`/reports/campaign/${id}/resume`);
		} catch (err) {}
	}
}

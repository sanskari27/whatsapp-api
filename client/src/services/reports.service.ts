import APIInstance from '../config/APIInstance';

export default class ReportsService {
    static async generateAllCampaigns() {
        try {
            const { data: response } = await APIInstance.get(
                `/reports/campaign`
            );

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
        } catch (err) {
            return null;
        }
    }
    static async resumeCampaign(id: string) {
        try {
            await APIInstance.post(`/reports/campaign/${id}/resume`);
        } catch (err) {
            return null;
        }
    }
    static async deleteCampaign(id: string) {
        try {
            await APIInstance.delete(`/reports/campaign/${id}/delete`);
        } catch (err) {
            return null;
        }
    }
    static async generateReport(id: string) {
        try {
            const response = await APIInstance.get(`/reports/campaign/${id}`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'text/csv' });

            // Create a temporary link element
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = 'generated_report.csv'; // Specify the filename

            // Append the link to the body and trigger the download
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Clean up - remove the link
            document.body.removeChild(downloadLink);
        } catch (err) {
            //ignore
        }
    }
}

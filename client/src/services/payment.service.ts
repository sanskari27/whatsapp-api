import APIInstance from '../config/APIInstance';

type PaymentRecord =
    | {
          type: 'payment';
          id: string;
          date: string;
          amount: number;
      }
    | {
          type: 'subscription';
          id: string;
          plan: string;
          isActive: boolean;
          isPaused: boolean;
      };

export default class PaymentService {
    static async paymentRecords({ csv }: { csv: boolean } = { csv: false }) {
        if (csv) {
            const response = await APIInstance.get(
                `/payment?csv=${csv ? 'true' : 'false'}`,

                { responseType: 'blob' }
            );
            const blob = new Blob([response.data], { type: 'text/csv' });

            // Create a temporary link element
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = 'Payments.csv'; // Specify the filename

            // Append the link to the body and trigger the download
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Clean up - remove the link
            document.body.removeChild(downloadLink);
        } else {
            try {
                const { data: response } = await APIInstance.get('/payment');

                return response.payments as PaymentRecord[];
            } catch (err) {
                return [];
            }
        }

        try {
            const { data: response } = await APIInstance.get('/payment');

            return response.payments as PaymentRecord[];
        } catch (err) {
            return [];
        }
    }
    static async pauseSubscription(id: string) {
        try {
            await APIInstance.get(`/payment/${id}/pause`);
        } catch (err) {
            //ignore
        }
    }
    static async resumeSubscription(id: string) {
        try {
            await APIInstance.get(`/payment/${id}/resume`);
        } catch (err) {
            //ignore
        }
    }
    static async paymentInvoiceDownload(id: string, date: string) {
        try {
            const response = await APIInstance.get(`/payment/${id}/invoice`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });

            // Create a temporary link element
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = `invoice ${date}.pdf`; // Specify the filename

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

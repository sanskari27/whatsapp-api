import APIInstance from '../config/APIInstance';

export default class NumbersValidatorService {
    static async validateNumbers(data: {
        csv_file?: string;
        type: 'NUMBERS' | 'CSV';
        numbers?: string[];
    }) {
        try {
            const response = await APIInstance.post(
                `/whatsapp/validate-numbers`,
                data,
                { responseType: 'blob' }
            );

            const blob = new Blob([response.data], { type: 'text/csv' });

            // Create a temporary link element
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = 'Contacts.csv'; // Specify the filename

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

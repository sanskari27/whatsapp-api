export default class ExportsService {
    static async exportPaymentsExcel(
        records: {
            date: string;
            amount: number;
        }[]
    ) {
        try {
            // ExcelUtils.exportPayments(records);
            console.log(records);
        } catch (err) {
            //ignore
        }
    }
}

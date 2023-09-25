import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SERVER_URL } from '../../../utils/const';

export default function ConfirmRazorpayTransaction() {
	const { transaction_id } = useParams();

	useEffect(() => {
		if (!transaction_id) return;

		fetch(`${SERVER_URL}/payment/${transaction_id}/verify-payment`, {
			method: 'POST',
		})
			.then(() => {
				//handle success
				console.log('Payment successful');
			})
			.catch((err) => {
				console.log(err);
			});
	}, [transaction_id]);

	return <></>;
}

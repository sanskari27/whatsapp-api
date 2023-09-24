import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { APP_URL, RAZORPAY_KEY_ID, ROUTES } from '../../../utils/const';

export default function InitiateRazorpayPayment() {
	//get url query params from react hook

	const [searchParams] = useSearchParams();
	useEffect(() => {
		const currency = searchParams.get('currency');
		const name = searchParams.get('name');
		const description = searchParams.get('description');
		const order_id = searchParams.get('order_id');
		const transaction_id = searchParams.get('transaction_id');

		const options = {
			key: RAZORPAY_KEY_ID as string,
			currency: currency as string,
			name: name as string,
			description: description as string,
			order_id: order_id as string,
			callback_url: `${APP_URL}${ROUTES.CONFIRM_RAZORPAY_PAYMENT}/${transaction_id}`,
			theme: {
				color: '#4CB072',
			},
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const rzp1 = new (window as any).Razorpay(options);

		rzp1.open();
	}, [searchParams]);

	return <></>;
}

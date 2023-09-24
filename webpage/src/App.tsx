import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from './utils/const';
import InitiateRazorpayPayment from './views/pages/razorpay/InitiateRazorpayPayment';
import ConfirmRazorpayTransaction from './views/pages/razorpay/ConfirmRazorpayTransaction';

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path={ROUTES.INITIATE_RAZORPAY_PAYMENT} element={<InitiateRazorpayPayment />} />
					<Route
						path={ROUTES.CONFIRM_RAZORPAY_PAYMENT + '/:transaction_id'}
						element={<ConfirmRazorpayTransaction />}
					/>

					<Route path='*' element={<></>} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;

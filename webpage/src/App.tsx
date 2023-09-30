import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from './utils/const';
import InitiateRazorpayPayment from './views/pages/razorpay/InitiateRazorpayPayment';
import PaymentConfirm from './views/pages/PaymentConfirm';

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path={ROUTES.INITIATE_RAZORPAY_PAYMENT} element={<InitiateRazorpayPayment />} />
					<Route path={ROUTES.CONFIRM_PAYMENT} element={<PaymentConfirm/>}/>
					<Route path='*' element={<></>} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;

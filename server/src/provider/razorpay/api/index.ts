import Orders from './orders';
import Refunds from './refunds';
import Validations from './validator';

const RazorpayProvider = {
	orders: Orders,
	refunds: Refunds,
	validations: Validations,
};

export default RazorpayProvider;

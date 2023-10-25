import Customers from './customers';
import Orders from './orders';
import Refunds from './refunds';
import Validations from './validator';

const RazorpayProvider = {
	customers: Customers,
	orders: Orders,
	refunds: Refunds,
	validations: Validations,
};

export default RazorpayProvider;

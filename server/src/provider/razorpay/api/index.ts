import Customers from './customers';
import Orders from './orders';
import Refunds from './refunds';
import Subscription from './subscription';
import Validations from './validator';

const RazorpayProvider = {
	customers: Customers,
	orders: Orders,
	subscription: Subscription,
	refunds: Refunds,
	validations: Validations,
};

export default RazorpayProvider;

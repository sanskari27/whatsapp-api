import RazorpayAPI from '../../config/RazorpayAPI';

async function createCustomer(details: {
	name: string;
	email: string;
	phone_number: string;
	billing_address?: {
		street: string;
		city: string;
		district: string;
		state: string;
		country: string;
		pincode: string;
	};
}) {
	const notes = { ...details.billing_address };

	try {
		const customer = await RazorpayAPI.customers.create({
			name: details.name,
			contact: details.phone_number,
			email: details.email,
			notes: notes,
		});

		return {
			id: customer.id,
			name: customer.name,
			contact: customer.contact,
			email: customer.email,
			billing_address: {
				street: customer.notes?.street as string | undefined | null,
				city: customer.notes?.city as string | undefined | null,
				district: customer.notes?.district as string | undefined | null,
				state: customer.notes?.state as string | undefined | null,
				country: customer.notes?.country as string | undefined | null,
				pincode: customer.notes?.pincode as string | undefined | null,
			},
		};
	} catch (err: any) {
		if (err.statusCode === 400) {
			return await fetchCustomerByContact(details.phone_number);
		}
	}
}

async function fetchCustomerByContact(number: string) {
	const customers = await RazorpayAPI.customers.all();

	const customer = customers.items.find((customer) =>
		customer.contact?.toString().includes(number)
	);
	if (!customer) {
		return null;
	}

	return {
		id: customer.id,
		name: customer.name,
		contact: customer.contact,
		email: customer.email,
		billing_address: {
			street: customer.notes?.street as string | undefined | null,
			city: customer.notes?.city as string | undefined | null,
			district: customer.notes?.district as string | undefined | null,
			state: customer.notes?.state as string | undefined | null,
			country: customer.notes?.country as string | undefined | null,
			pincode: customer.notes?.pincode as string | undefined | null,
		},
	};
}

async function fetchCustomer(id: string) {
	const customer = await RazorpayAPI.customers.fetch(id);

	return {
		id: customer.id,
		name: customer.name,
		contact: customer.contact,
		email: customer.email,
		billing_address: {
			street: customer.notes?.street as string | undefined | null,
			city: customer.notes?.city as string | undefined | null,
			district: customer.notes?.district as string | undefined | null,
			state: customer.notes?.state as string | undefined | null,
			country: customer.notes?.country as string | undefined | null,
			pincode: customer.notes?.pincode as string | undefined | null,
		},
	};
}

export default {
	createCustomer,
	fetchCustomer,
};

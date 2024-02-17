export type PaymentRecords = {
	list: PaymentRecord[];
	paymentRecord: PaymentRecord;
	uiDetails: {
		isSaving: boolean;
		isFetching: boolean;
		isDeleting: boolean;
		isCreating: boolean;
		isUpdating: boolean;
		error: string;
	};
};

export type PaymentRecord = {
	transaction_date: string;
	order_id: string;
	plan: string;
	whatsapp_numbers: string[];
	name: string;
	phone_number: string;
	email: string;
	admin_number: string;
	billing_address: {
		street: string;
		city: string;
		district: string;
		state: string;
		country: string;
		pincode: string;
		gstin: string;
	};
	gross_amount: number;
	discount: number;
	total_amount: number;
	tax: number;
	transaction_status: string;
	invoice_id: string;
	coupon: string;
};

import { UserDetailsType, WhatsappNumber } from '..';

export const validatePersonalDetails = (userDetails: UserDetailsType) => {
	const { name, email, phone_number } = userDetails;
	const errorObject = {} as typeof userDetails;
	let hasError = false;
	if (!name) {
		errorObject.name = 'Name is required';
		hasError = true;
	}
	if (!email) {
		errorObject.email = 'Email is required';
		hasError = true;
	}
	if (!phone_number) {
		errorObject.phone_number = 'Phone Number is required';
		hasError = true;
	}
	return [!hasError, hasError ? errorObject : null] as [boolean, typeof errorObject | null];
};

export const validateBillingDetails = (userDetails: UserDetailsType) => {
	const {
		billing_address: { city, country, district, pincode, state, street },
	} = userDetails;
	const errorObject = { billing_address: {} } as typeof userDetails;
	let hasError = false;
	if (!street) {
		errorObject.billing_address.street = 'Street is required';
		hasError = true;
	}
	if (!city) {
		errorObject.billing_address.city = 'City is required';
		hasError = true;
	}
	if (!state) {
		errorObject.billing_address.state = 'State is required';
		hasError = true;
	}
	if (!pincode) {
		errorObject.billing_address.pincode = 'Pincode is required';
		hasError = true;
	}
	if (!district) {
		errorObject.billing_address.district = 'District is required';
		hasError = true;
	}
	if (!country) {
		errorObject.billing_address.country = 'Country is required';
		hasError = true;
	}
	return [!hasError, hasError ? errorObject : null] as [boolean, typeof errorObject | null];
};

export const validateWhatsappNumbers = (whatsappNumbers: WhatsappNumber[]) => {
	for (const whatsapp_number of whatsappNumbers) {
		if (whatsapp_number.phone_number.length < 10) {
			return [false, 'Whatsapp Number is required'] as [boolean, string];
		}
	}

	return [true, ''] as [boolean, string];
};

export const validatePincode = async (pincode: string) => {
	const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
	const data = await res.json();
	const { PostOffice, Message } = data[0];
	if (Message === 'No records found') {
		return Promise.reject();
	}
	if (PostOffice.length === 0) {
		return Promise.reject();
	}
	const { State, Country, District } = PostOffice[0];
	return {
		state: State,
		country: Country,
		district: District,
	};
};

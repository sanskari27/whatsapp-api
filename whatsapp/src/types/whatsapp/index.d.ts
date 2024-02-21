export type TContact = {
	name: string;
	number: string;
	country: string;
	isBusiness: string;
	public_name: string;
};

export type TBusinessContact = TContact & {
	description: string;
	email: string;
	websites: string[];
	latitude: number;
	longitude: number;
	address: string;
};

type GroupDetails = {
	group_name: string;
	user_type: 'CREATOR' | 'ADMIN' | 'USER';
};
type LabelDetails = {
	group_name: string;
	label: string;
};

export type TGroupContact = TContact & GroupDetails;
export type TGroupBusinessContact = TBusinessContact & GroupDetails;

export type TLabelContact = TContact & LabelDetails;
export type TLabelBusinessContact = TBusinessContact & LabelDetails;

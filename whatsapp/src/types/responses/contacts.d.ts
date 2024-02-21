export type ResponseContact = {
	name: string | undefined;
	number: string;
	isBusiness: string;
	country: string;
	public_name: string;
	description?: string;
	email?: string;
	websites?: string[];
	latitude?: number;
	longitude?: number;
	address?: string;
};

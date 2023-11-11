const START = 'BEGIN:VCARD\nVERSION:3.0\n';
const END = 'END:VCARD';

type VCardDetails = {
	first_name: string;
	middle_name: string;
	last_name: string;
	title: string;
	organization: string;
	email_work: string;
	links: string[];
	street: string;
	city: string;
	state: string;
	country: string;
	pincode: string;
	contact_details_phone: {
		whatsapp_id?: string;
		contact_number: string;
	};
	contact_details_work: {
		whatsapp_id?: string;
		contact_number: string;
	};
	contact_details_other: {
		whatsapp_id?: string;
		contact_number: string;
	}[];
};

export default class VCardBuilder {
	private first_name: string;
	private last_name: string;
	private middle_name: string;

	private title: string;
	private organization: string;

	private contact_details_phone?: {
		whatsapp_id?: string;
		contact_number: string;
	};
	private contact_details_work?: {
		whatsapp_id?: string;
		contact_number: string;
	};
	private contact_details_other: {
		whatsapp_id?: string;
		contact_number: string;
	}[];

	private email_personal?: string;
	private email_work: string;

	private links: string[];

	private street: string;
	private city: string;
	private state: string;
	private country: string;
	private pincode: string;

	constructor(details: Partial<VCardDetails>) {
		this.first_name = details.first_name ?? '';
		this.middle_name = details.middle_name ?? '';
		this.last_name = details.last_name ?? '';
		this.title = details.title ?? '';
		this.organization = details.organization ?? '';
		this.email_work = details.email_work ?? '';
		this.links = details.links ?? [];
		this.street = details.street ?? '';
		this.city = details.city ?? '';
		this.state = details.state ?? '';
		this.country = details.country ?? '';
		this.pincode = details.pincode ?? '';
		this.contact_details_other = details.contact_details_other ?? [];
		this.contact_details_phone = details.contact_details_phone ?? undefined;
		this.contact_details_work = details.contact_details_work ?? undefined;
	}

	public build(): string {
		let vCardString = START;

		// Add Name to the card

		let full_name = '';
		if (this.first_name) {
			full_name = this.first_name.trim() + ' ';
		}

		if (this.middle_name) {
			full_name += this.middle_name.trim() + '';
		}
		if (this.last_name) {
			full_name += this.last_name.trim() + '';
		}

		vCardString += `FN;CHARSET=utf-8:${full_name.trim()}\n`;
		vCardString += `N;CHARSET=utf-8:${this.last_name};${this.first_name};${this.middle_name};;\n`;

		//Add Title and organization to vcard
		if (this.title) vCardString += `TITLE;CHARSET=utf-8:${this.title}\n`;
		if (this.organization) vCardString += `ORG;CHARSET=utf-8:${this.organization}\n`;

		// Add Contact details
		if (this.contact_details_phone) {
			const { whatsapp_id: waid, contact_number: c_no } = this.contact_details_phone;
			vCardString += 'TEL;TYPE=PHONE';
			if (waid) {
				vCardString += `;waid=${waid}:${c_no}`;
			} else {
				vCardString += `,VOICE:${c_no}`;
			}
			vCardString += '\n';
		}

		if (this.contact_details_work) {
			const { whatsapp_id: waid, contact_number: c_no } = this.contact_details_work;
			vCardString += 'TEL;TYPE=WORK';
			if (waid) {
				vCardString += `;waid=${waid}:${c_no}`;
			} else {
				vCardString += `,VOICE:${c_no}`;
			}
			vCardString += '\n';
		}

		for (const contact of this.contact_details_other) {
			const { whatsapp_id: waid, contact_number: c_no } = contact;
			vCardString += 'TEL;TYPE=OTHER';
			if (waid) {
				vCardString += `;waid=${waid}:${c_no}`;
			} else {
				vCardString += `,VOICE:${c_no}`;
			}
			vCardString += '\n';
		}

		//Add Personal and Work email to vcard
		if (this.email_personal) vCardString += `EMAIL;type=HOME,INTERNET:${this.email_personal}\n`;
		if (this.email_work) vCardString += `EMAIL;type=WORK,INTERNET:${this.email_work}\n`;
		for (const link of this.links) {
			
			vCardString += `URL;CHARSET=UTF-8:${link}\r\n`;
		}

		if (this.street || this.city || this.state || this.pincode || this.country) {
			vCardString += `ADR;type=WORK:;;`;
			vCardString += `${this.street};`;
			vCardString += `${this.city};`;
			vCardString += `${this.state};`;
			vCardString += `${this.pincode};`;
			vCardString += `${this.country};`;
			vCardString += `\n`;
		}

		return vCardString + END;
	}

	public setFirstName(name: string) {
		this.first_name = name;
		return this;
	}

	public setLastName(name: string) {
		this.last_name = name;
		return this;
	}

	public setMiddleName(name: string) {
		this.middle_name = name;
		return this;
	}

	public setTitle(title: string) {
		this.title = title;
		return this;
	}

	public setOrganization(organization: string) {
		this.organization = organization;
		return this;
	}

	public setContactPhone(contact_number: string, whatsapp_id?: string) {
		this.contact_details_phone = {
			contact_number,
			whatsapp_id,
		};
		return this;
	}
	public setContactWork(contact_number: string, whatsapp_id?: string) {
		this.contact_details_work = {
			contact_number,
			whatsapp_id,
		};
		return this;
	}
	public addContactOther(contact_number: string, whatsapp_id?: string) {
		this.contact_details_other.push({
			contact_number,
			whatsapp_id,
		});
		return this;
	}
	public setEmail(email: string) {
		this.email_personal = email;
		return this;
	}

	public setWorkEmail(email: string) {
		this.email_work = email;
		return this;
	}
	public setStreet(street: string) {
		this.street = street;
		return this;
	}

	public setCity(city: string) {
		this.city = city;
		return this;
	}
	public setState(state: string) {
		this.state = state;
		return this;
	}

	public setCountry(country: string) {
		this.country = country;
		return this;
	}
	public setPincode(pincode: string) {
		this.pincode = pincode;
		return this;
	}
	public addLink(link: string) {
		this.links.push(link);
		return this;
	}
}

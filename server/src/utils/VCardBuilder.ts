const START = 'BEGIN:VCARD\nVERSION:3.0\n';
const END = 'END:VCARD';
export default class VCardBuilder {
	private first_name: string;
	private last_name: string;

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

	private email_personal?: string;
	private email_work: string;

	private link: string;

	private street: string;
	private city: string;
	private state: string;
	private country: string;
	private pincode: string;

	constructor() {
		this.first_name = '';
		this.last_name = '';
		this.title = '';
		this.organization = '';
		this.email_work = '';
		this.link = '';
		this.street = '';
		this.city = '';
		this.state = '';
		this.country = '';
		this.pincode = '';
	}

	public build(): string {
		let vCardString = START;

		// Add Name to the card

		if (this.first_name || this.last_name) {
			const full_name = `${this.first_name} ${this.last_name}`.trim();
			vCardString += `FN:${full_name}\n`;
			vCardString += `N;${this.last_name};${this.first_name}\n`;
		}

		//Add Title and organization to vcard
		if (this.title) vCardString += `TITLE;${this.title}\n`;
		if (this.organization) vCardString += `ORG;${this.organization}\n`;

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

		//Add Personal and Work email to vcard
		if (this.email_personal) vCardString += `EMAIL;type=HOME,INTERNET:${this.email_personal}\n`;
		if (this.email_work) vCardString += `EMAIL;type=WORK,INTERNET:${this.email_work}\n`;
		if (this.link) vCardString += `URL;CHARSET=UTF-8:${this.link}\r\n`;

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
	public setLink(link: string) {
		this.link = link;
		return this;
	}
}

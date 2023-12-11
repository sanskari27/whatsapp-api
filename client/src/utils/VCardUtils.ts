type TContact = {
	name: string;
	number: string;
	isBusiness: string;
	country: string;
	public_name: string;
};

type TParticipant = TContact & {
	user_type: string;
	group_name: string;
};

type TLabelParticipant = TContact & {
	group_name: string;
	label: string;
};

export default class VCardUtils {
	static async exportContacts(contacts: TContact[], filename: string) {
		const vCardString = contacts.reduce((acc, contact) => {
			const text = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${
				contact.name ?? contact.public_name
			}\r\nTEL;TYPE=CELL:${contact.number}\r\nEND:VCARD\r\n`;
			return acc + text;
		}, '');

		const blob = new Blob([vCardString], { type: 'text/vcf' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', `${filename}.vcf`);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async exportGroup(participants: TParticipant[]) {
		const vCardString = participants.reduce((acc, contact) => {
			const text = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${
				contact.name ?? contact.public_name
			}\r\nTEL;TYPE=CELL:${contact.number}\r\nEND:VCARD\r\n`;
			return acc + text;
		}, '');

		const blob = new Blob([vCardString], { type: 'text/vcf' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'group_contacts.vcf');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async exportLabel(participants: TLabelParticipant[]) {
		const vCardString = participants.reduce((acc, contact) => {
			const text = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${
				contact.name ?? contact.public_name
			}\r\nTEL;TYPE=CELL:${contact.number}\r\nEND:VCARD\r\n`;
			return acc + text;
		}, '');

		const blob = new Blob([vCardString], { type: 'text/vcf' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'label_contacts.vcf');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}

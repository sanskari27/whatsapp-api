import mongoose, { Schema } from 'mongoose';
import IContactCard from '../../../types/contact-cards';
import QRUtils from '../../../utils/QRUtils';
import VCardBuilder from '../../../utils/VCardBuilder';

const contactCardSchema = new mongoose.Schema<IContactCard>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	first_name: String,
	middle_name: String,
	last_name: String,
	title: String,
	organization: String,
	email_personal: String,
	email_work: String,
	links: [String],
	street: String,
	city: String,
	state: String,
	country: String,
	pincode: String,
	contact_details_phone: {
		whatsapp_id: String,
		contact_number: String,
	},
	contact_details_work: {
		whatsapp_id: String,
		contact_number: String,
	},
	contact_details_other: [
		{
			whatsapp_id: String,
			contact_number: String,
		},
	],

	vCardString: String,
	qrString: String,
});

contactCardSchema.pre('save', async function (next) {
	if (!this.isModified) {
		next();
	}
	this.vCardString = new VCardBuilder(this).build();
	const qrCodeBuffer = await QRUtils.generateQR(this.vCardString);
	if (qrCodeBuffer) {
		this.qrString = qrCodeBuffer.toString();
	}
	next();
});

const ContactCardDB = mongoose.model<IContactCard>('ContactCard', contactCardSchema);

export default ContactCardDB;

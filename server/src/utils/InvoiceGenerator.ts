import fs from 'fs';
import PDFKit from 'pdfkit';
const LINE_HEIGHT = 12.5;

export type NonGSTBill = {
	discount: string;
	sub_total: string;
	gst_bill: false;
	total: string;
	total_in_words: string;
};
export type GSTBill = {
	discount: string;
	sub_total: string;
	gst_bill: true;
	total: string;
	total_in_words: string;
};

export type IGSTBill = GSTBill & {
	isIGST: true;
	igst: string;
};
export type SGSTBill = GSTBill & {
	isIGST: false;
	cgst: string;
	sgst: string;
};

export default class InvoiceGenerator {
	private filename: string;
	private pdf: PDFKit.PDFDocument;
	private x: number;
	private y: number;

	constructor(filename: string) {
		this.filename = filename;
		this.pdf = new PDFKit({
			size: 'A4',
			margins: {
				top: 10,
				bottom: 30,
				left: 40,
				right: 40,
			},
		});
		this.pdf.pipe(fs.createWriteStream(filename));
		this.pdf.font('Times-Roman');
		this.x = 40;
		this.y = 0;
	}

	addHeader(invoice_no: string) {
		let { x, y } = this;
		this.pdf
			.fontSize(30)
			.font('Times-Bold')
			.text('INVOICE', x + 20, (y = y + 75), {
				align: 'right',
			});
		this.pdf
			.fontSize(18)
			.font('Times-Roman')
			.text(`# INV-${invoice_no}`, x + 20, (y = y + 35), {
				align: 'right',
			});

		this.pdf
			.font('Times-Bold')
			.fontSize(14)
			.text('Stellar Coaching & Consulting', x, (y = y - 35), {
				align: 'left',
			});

		this.pdf
			.font('Times-Roman')
			.fontSize(12)
			.text('B-502, Plot No. 11,', x, (y = y + 15), {
				align: 'left',
			})
			.text('Sector-6 Dwarka', x, (y = y + LINE_HEIGHT), {
				align: 'left',
			})
			.text('New Delhi 110075', x, (y = y + LINE_HEIGHT), {
				align: 'left',
			})
			.text('India', x, (y = y + LINE_HEIGHT), {
				align: 'left',
			})
			.text('GSTIN 07ADEPV4249D1ZH', x, (y = y + LINE_HEIGHT), {
				align: 'left',
			});
		this.pdf
			.moveTo(x, y + 35) // set the current point
			.lineTo(x + 515, y + 35)
			.stroke('black');

		this.y = y;
	}

	addBillingDetails({
		name,
		billing_address,
		payment_details,
	}: {
		name: string;
		billing_address: {
			street: string;
			city: string;
			district: string;
			state: string;
			country: string;
			pincode: string;
			gstin: string;
		};
		payment_details: {
			invoice_date: string;
			payment_id: string;
			order_id: string;
		};
	}) {
		let { x, y } = this;
		y = y + 40;
		const temp_y = y;
		let max_y = 0;

		this.pdf
			.font('Times-Roman')
			.fontSize(12)
			.text('Billing Address:', x, (y = y + 20), {
				align: 'left',
			});

		this.pdf.font('Times-Bold').text(name, x, (y = y + LINE_HEIGHT), {
			align: 'left',
		});

		this.pdf
			.font('Times-Roman')
			.text(billing_address.street, x, (y = y + LINE_HEIGHT))
			.text(`${billing_address.city}, ${billing_address.district}`, x, (y = y + LINE_HEIGHT))
			.text(billing_address.state, x, (y = y + LINE_HEIGHT))
			.text(billing_address.country, x, (y = y + LINE_HEIGHT))
			.text(billing_address.pincode, x, (y = y + LINE_HEIGHT));

		if (billing_address.gstin) {
			this.pdf.font('Times-Roman').text(`GSTIN ${billing_address.gstin}`, x, (y = y + LINE_HEIGHT));
		}

		x = x + 200;
		max_y = y;
		y = temp_y;

		this.pdf
			.font('Times-Roman')
			.fontSize(12)
			.text('Shipping Address:', x, (y = y + 20), {
				align: 'left',
			});

		this.pdf.font('Times-Bold').text(name, x, (y = y + LINE_HEIGHT), {
			align: 'left',
		});

		this.pdf
			.font('Times-Roman')
			.text(billing_address.street, x, (y = y + LINE_HEIGHT))
			.text(`${billing_address.city}, ${billing_address.district}`, x, (y = y + LINE_HEIGHT))
			.text(billing_address.state, x, (y = y + LINE_HEIGHT))
			.text(billing_address.country, x, (y = y + LINE_HEIGHT))
			.text(billing_address.pincode, x, (y = y + LINE_HEIGHT));

		y = temp_y;
		this.pdf.text(`Invoice Date: ${payment_details.invoice_date}`, x, (y = y + 20), {
			align: 'right',
		});
		this.pdf.fontSize(10).text(`Payment ID: ${payment_details.payment_id}`, x, (y = y + 20), {
			align: 'right',
		});
		this.pdf.text(`Order ID: ${payment_details.order_id}`, x, (y = y + 20), {
			align: 'right',
		});

		this.y = max_y;
		this.addItemDetails();
	}

	private addItemDetails() {
		const x = this.x;
		let y = this.y;
		y = y + 40;
		this.pdf
			.lineWidth(25)
			.lineCap('butt')
			.moveTo(x, y + 5) // set the current point
			.lineTo(x + 515, y + 5)
			.stroke('#3a3a3a');

		this.pdf
			.fontSize(14)
			.fillColor('white')
			.text('#', x + 20, y, {
				align: 'left',
			})
			.text('Item & Description', x + 60, y)
			.text('Qty', x + 300, y)
			.text('Rate', x + 370, y)
			.text('Amount', x + 460, y)
			.fillColor('black');

		this.y = y;
	}

	addProduct(product: {
		id: string;
		service: string;
		plan: string;
		sac: string;
		start: string;
		end: string;
		qty: string;
		rate: string;
		amount: string;
	}) {
		const x = this.x;
		let y = this.y;
		y = y + 20;

		this.pdf
			.fillColor('black')
			.font('Times-Roman')
			.text(product.id, x + 20, (y = y + 5))
			.text(`Service : ${product.service}`, x + 60, y)
			.text(product.qty, x + 300, y)
			.text(product.rate, x + 370, y)
			.text(product.amount, x + 460, y);

		this.pdf
			.fillColor('black')
			.font('Times-Roman')
			.text(`Plan : ${product.plan}`, x + 60, (y = y + 20))
			.text(`From : ${product.start}`, x + 60, (y = y + 20))
			.text(`End  : ${product.end}`, x + 60, (y = y + 20))
			.text(`SAC : ${product.sac}`, x + 60, (y = y + 20));

		this.y = y;
	}

	addAmountDetails(details: IGSTBill | SGSTBill | NonGSTBill) {
		const x = this.x;
		let y = this.y;
		y = y + 20;

		this.pdf
			.lineWidth(1)
			.moveTo(x, (y = y + 5)) // set the current point
			.lineTo(x + 515, y)
			.dash(5, { space: 4 })
			.stroke('black');

		this.pdf.text(`Discount :`, x + 350, (y = y + 20));
		this.pdf.text(details.discount, x, y, { align: 'right' });
		this.pdf.text(`Sub Total :`, x + 350, (y = y + 20));
		this.pdf.text(details.sub_total, x, y, { align: 'right' });

		if (details.gst_bill) {
			if (!details.isIGST) {
				this.pdf.text(`CGST9 (9%) :`, x + 350, (y = y + 20));
				this.pdf.text(details.cgst, x, y, { align: 'right' });
				this.pdf.text(`SGST9 (9%) :`, x + 350, (y = y + 20));
				this.pdf.text(details.sgst, x, y, { align: 'right' });
			} else {
				this.pdf.text(`IGST9 (18%) :`, x + 350, (y = y + 20));
				this.pdf.text(details.igst, x, y, { align: 'right' });
			}
		}
		this.pdf.font('Times-Bold').text(`Total :`, x + 350, (y = y + 40));
		this.pdf.text(details.total, x, y, { align: 'right' });

		this.pdf
			.rect(x + 220, y - 15, 300, 40)
			.fillOpacity(0.1)
			.fill('gray');

		this.pdf
			.fill('black')
			.fillOpacity(1)
			.font('Times-Bold')
			.text(`Total (in words): ${details.total_in_words}`, x, (y = y + 40), {
				align: 'right',
			});
		this.y = y;
	}

	addFooter(details: { invoice_date: string }) {
		let { x, y } = this;
		y = y + 140;

		this.pdf
			.font('Times-Roman')
			.fontSize(10)
			.text('Digitally Signed by', x, y, { align: 'right' })
			.text('Stellar Coaching & Consulting', { align: 'right' })
			.text(`Date : ${details.invoice_date}`, { align: 'right' });
	}

	async build() {
		this.pdf.end();
		const pdfStream = fs.createReadStream(this.filename);
		return pdfStream;
	}
}

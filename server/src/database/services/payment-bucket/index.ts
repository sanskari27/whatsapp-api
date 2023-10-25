import { Types } from 'mongoose';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import IPaymentBucket from '../../../types/payment-bucket';
import PaymentBucketDB from '../../repository/payment-bucket';
import PaymentService from '../payments';

export default class PaymentBucketService {
	private bucket: IPaymentBucket;
	private paymentService: PaymentService;

	constructor(bucket: IPaymentBucket) {
		this.bucket = bucket;
		this.paymentService = new PaymentService(bucket);
	}

	public static async createBucket(data: {
		plan_name: string;
		phone_number: string;
		name: string;
		email: string;
		whatsapp_numbers: string[];
		billing_address: {
			street: string;
			city: string;
			district: string;
			state: string;
			country: string;
			pincode: string;
		};
	}) {
		const bucket = await PaymentBucketDB.create(data);
		return new PaymentBucketService(bucket);
	}

	static async getBucketById(id: Types.ObjectId) {
		const bucket = await PaymentBucketDB.findById(id);
		if (!bucket) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND);
		}
		return new PaymentBucketService(bucket);
	}

	getBucket() {
		return this.bucket;
	}

	async initialize(transaction_id?: Types.ObjectId) {
		await this.paymentService.initialize(transaction_id);
	}

	getTransactionDetails() {
		return this.paymentService.getTransactionDetails();
	}

	async generatePaymentLink() {
		const transactionDetails = this.paymentService.getTransactionDetails();
		return {
			transaction_id: transactionDetails.transaction_id,
			gross_amount: transactionDetails.gross_amount,
			tax: transactionDetails.tax,
			discount: transactionDetails.discount,
			total_amount: transactionDetails.total_amount,
		};
	}
}

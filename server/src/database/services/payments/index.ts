import { Types } from 'mongoose';
import { BILLING_PLANS_DETAILS, WALLET_TRANSACTION_STATUS } from '../../../config/const';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import RazorpayProvider from '../../../provider/razorpay';
import IPayment from '../../../types/payment';
import IPaymentBucket from '../../../types/payment-bucket';
import DateUtils from '../../../utils/DateUtils';
import CouponDB from '../../repository/coupon';
import PaymentDB from '../../repository/payments';
import { RAZORPAY_API_KEY } from '../../../provider/razorpay/config/const';

export default class PaymentService {
	private bucket: IPaymentBucket;
	private walletTransaction: IPayment | null;
	public constructor(bucket: IPaymentBucket) {
		this.bucket = bucket;
		this.walletTransaction = null;
	}

	// public static async fetchTransactionDetails(id: Types.ObjectId) {
	// 	const walletTransaction = await PaymentDB.findById(id);
	// 	if (walletTransaction === null) {
	// 		throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND);
	// 	}
	// 	return {
	// 		transaction_id: walletTransaction._id,
	// 		gross_amount: walletTransaction.gross_amount,
	// 		tax: walletTransaction.tax,
	// 		discount: walletTransaction.discount,
	// 		total_amount: walletTransaction.total_amount,
	// 		status: walletTransaction.transaction_status,
	// 	};
	// }

	public async initialize(id?: Types.ObjectId) {
		if (id) {
			const walletTransaction = await PaymentDB.findById(id);
			if (
				walletTransaction === null ||
				String(walletTransaction.bucket._id) !== String(this.bucket._id)
			) {
				throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND);
			}
			this.walletTransaction = walletTransaction;
		} else {
			await this.createWalletTransaction();
		}
	}

	getTransactionDetails() {
		if (this.walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_SERVICE_UNINITIALIZED);
		}
		return {
			bucket_id: this.bucket._id,
			transaction_id: this.walletTransaction._id,
			gross_amount: this.walletTransaction.gross_amount,
			tax: this.walletTransaction.tax,
			discount: this.walletTransaction.discount,
			total_amount: this.walletTransaction.total_amount,
			status: this.walletTransaction.transaction_status,
		};
	}

	private async createWalletTransaction() {
		const amount = BILLING_PLANS_DETAILS[this.bucket.plan_name].amount;

		this.walletTransaction = await PaymentDB.create({
			bucket: this.bucket,
			gross_amount: amount,
			transaction_status: WALLET_TRANSACTION_STATUS.PENDING,
			transaction_date: DateUtils.getDate(),
		});
	}

	async applyCoupon(coupon: string) {
		if (this.walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_SERVICE_UNINITIALIZED);
		}
		const couponDetails = await CouponDB.findOne({ code: coupon });

		if (couponDetails === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.COUPON_NOT_FOUND);
		}
		if (this.walletTransaction.discount_coupon) {
			await this.removeCoupon();
		}

		this.walletTransaction.discount =
			couponDetails.discount_percentage * this.walletTransaction.gross_amount;
		couponDetails.available_coupons -= 1;
		this.walletTransaction.discount_coupon = couponDetails;

		await this.walletTransaction.save();
		await couponDetails.save();
	}

	async removeCoupon() {
		if (this.walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_SERVICE_UNINITIALIZED);
		}

		if (this.walletTransaction.discount_coupon === null) {
			return;
		}
		this.walletTransaction.discount_coupon.available_coupons += 1;
		this.walletTransaction.discount = 0;

		await this.walletTransaction.save();
	}

	async initializeRazorpay() {
		if (this.walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_SERVICE_UNINITIALIZED);
		}

		const customer = await RazorpayProvider.customers.createCustomer({
			name: this.bucket.name,
			email: this.bucket.email,
			phone_number: this.bucket.phone_number,
			billing_address: this.bucket.billing_address,
		});
		if (!customer) {
			throw new InternalError(INTERNAL_ERRORS.RAZORPAY_ERRORS.CUSTOMER_ERROR);
		}
		const { id: customer_id } = customer;

		const order = await RazorpayProvider.orders.createOrder({
			amount: this.walletTransaction.total_amount,
			reference_id: this.walletTransaction._id,
			customer_id: customer_id,
		});

		this.walletTransaction.reference_id = order.id;
		await this.walletTransaction.save();

		return {
			transaction_id: this.walletTransaction._id,
			order_id: order.id,
			razorpay_options: {
				description: 'Subscription',
				currency: order.currency,
				amount: order.amount * 100,
				name: 'Whatsapp Helper',
				order_id: order.id,
				prefill: {
					name: this.bucket.name,
					contact: this.bucket.phone_number,
					email: this.bucket.email,
				},
				key: RAZORPAY_API_KEY,
				theme: {
					color: '#4CB072',
				},
			},
		};
	}

	public async confirmTransaction() {
		if (this.walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_SERVICE_UNINITIALIZED);
		}

		if (this.walletTransaction.transaction_status === WALLET_TRANSACTION_STATUS.SUCCESS) {
			return;
		}

		const orderStatus = await RazorpayProvider.orders.getOrderStatus(
			this.walletTransaction.reference_id
		);

		if (orderStatus !== 'paid') {
			throw new InternalError(INTERNAL_ERRORS.RAZORPAY_ERRORS.ORDER_PENDING);
		}

		this.walletTransaction.transaction_status = WALLET_TRANSACTION_STATUS.SUCCESS;
		//TODO
		await this.walletTransaction.save();
	}

	static async getPaymentRecords(phone_number: string) {
		return PaymentDB.find({
			'bucket.whatsapp_numbers': phone_number,
			transaction_status: WALLET_TRANSACTION_STATUS.SUCCESS,
		});
	}

	static async getRunningPayment(phone_number: string) {
		return PaymentDB.findOne({
			'bucket.whatsapp_numbers': phone_number,
			transaction_status: WALLET_TRANSACTION_STATUS.SUCCESS,
			expires_at: {
				$gte: DateUtils.getMomentNow().toDate(),
			},
		});
	}
}

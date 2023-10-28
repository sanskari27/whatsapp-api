import { SUBSCRIPTION_STATUS, TRANSACTION_STATUS } from '../../../config/const';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import RazorpayProvider from '../../../provider/razorpay';
import { RAZORPAY_API_KEY } from '../../../provider/razorpay/config/const';
import IPaymentBucket from '../../../types/payment/payment-bucket';
import DateUtils from '../../../utils/DateUtils';
import { parseSubscriptionStatus } from '../../../utils/ExpressUtils';
import PaymentDB from '../../repository/payments/payment';
import SubscriptionDB from '../../repository/payments/subscription';
import UserService from '../user';

export default class PaymentService {
	private bucket: IPaymentBucket;
	public constructor(bucket: IPaymentBucket) {
		this.bucket = bucket;
	}

	async initializeOneTimePayment() {
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
		const payment = new PaymentDB({
			bucket: this.bucket,
			transaction_date: DateUtils.getDate(),
		});
		const order = await RazorpayProvider.orders.createOrder({
			amount: this.bucket.total_amount,
			reference_id: payment._id,
			customer_id: customer_id,
		});

		payment.order_id = order.id;
		payment.save();

		return {
			transaction_id: payment._id,
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

	public async confirmOneTimePayment(order_id: string, payment_id: string) {
		const walletTransaction = await PaymentDB.findOne({ order_id: order_id });
		if (walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND);
		}

		if (this.bucket.transaction_status === TRANSACTION_STATUS.SUCCESS) {
			return;
		}

		const order = await RazorpayProvider.orders.getOrder(order_id);

		if (order.status !== 'paid') {
			throw new InternalError(INTERNAL_ERRORS.RAZORPAY_ERRORS.ORDER_PENDING);
		}

		walletTransaction.amount = order.amount / 100;
		walletTransaction.payment_id = payment_id;
		walletTransaction.save();

		this.bucket.transaction_status = TRANSACTION_STATUS.SUCCESS;

		const month = this.bucket.plan.months;
		for (const number of this.bucket.whatsapp_numbers) {
			UserService.createUser(number).then((service) => service.addMonthToExpiry(month));
		}
		await this.bucket.save();
	}

	public async createSubscription() {
		const subscription_doc = new SubscriptionDB({
			bucket: this.bucket,
			plan: this.bucket.plan,
			coupon: this.bucket.discount_coupon,
		});

		const subscription = await RazorpayProvider.subscription.createSubscription({
			email: this.bucket.email,
			phone: this.bucket.phone_number,
			plan_id: subscription_doc.plan.plan_id,
			offer_id: subscription_doc.coupon?.offer_id,
		});

		subscription_doc.subscription_status = SUBSCRIPTION_STATUS.ACTIVE;
		subscription_doc.subscription_id = subscription.id;
		subscription_doc.subscription_link = subscription.short_url;
		subscription_doc.remaining_count = subscription.remaining_count;
		subscription_doc.paid_count = subscription.plan_count;
		subscription_doc.total_count = subscription.total_count;

		await subscription_doc.save();

		this.bucket.transaction_status = TRANSACTION_STATUS.RECURRING;
		await this.bucket.save();

		return {
			transaction_id: subscription_doc._id,
			subscription_id: subscription_doc.subscription_id,
			payment_link: subscription_doc.subscription_link,
		};
	}

	public async acceptSubscriptionPayment(subscription_id: string, payment_id: string) {
		const subscription_doc = await SubscriptionDB.findOne({ subscription_id });
		if (subscription_doc === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND);
		}

		if (this.bucket.transaction_status !== TRANSACTION_STATUS.RECURRING) {
			return;
		}

		const subscription = await RazorpayProvider.subscription.getSubscription(subscription_id);

		if (parseSubscriptionStatus(subscription.status) !== SUBSCRIPTION_STATUS.ACTIVE) {
			return;
		}
		const payment = await RazorpayProvider.payments.getPayment(payment_id);

		await PaymentDB.create({
			bucket: this.bucket,
			amount: payment.amount,
			order_id: payment.order_id,
			payment_id: payment.payment_id,
			transaction_date: DateUtils.getDate(),
		});

		const month = this.bucket.plan.months;
		for (const number of this.bucket.whatsapp_numbers) {
			UserService.createUser(number).then((service) => service.addMonthToExpiry(month));
		}
		await this.bucket.save();
	}

	static async getRunningPayment(phone_number: string) {
		return PaymentDB.findOne({
			'bucket.whatsapp_numbers': phone_number,
		}).sort({ transaction_date: -1 });
	}
	static async getPaymentRecords(phone_number: string) {
		return PaymentDB.find({
			'bucket.whatsapp_numbers': phone_number,
		});
	}
}

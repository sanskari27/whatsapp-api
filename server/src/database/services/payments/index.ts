import { Types } from 'mongoose';
import { WALLET_TRANSACTION_STATUS } from '../../../config/const';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import RazorpayProvider from '../../../provider/razorpay';
import { IUser } from '../../../types/user';
import DateUtils from '../../../utils/DateUtils';
import CouponDB from '../../repository/coupon';
import PaymentDB from '../../repository/payments';
import { UserDB } from '../../repository/user';

export default class PaymentService {
	private user: IUser;
	public constructor(user: IUser) {
		if (user === null) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.NOT_FOUND);
		}
		this.user = user;
	}

	public static async getService(phone: string) {
		const user = await UserDB.findOne({ phone });
		if (user === null) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.NOT_FOUND);
		}
		return new PaymentService(user);
	}
	public static async fetchTransactionDetails(id: Types.ObjectId) {
		const walletTransaction = await PaymentDB.findById(id);
		if (walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND);
		}
		return {
			transaction_id: walletTransaction._id,
			gross_amount: walletTransaction.gross_amount,
			tax: walletTransaction.tax,
			discount: walletTransaction.discount,
			total_amount: walletTransaction.total_amount,
			status: walletTransaction.transaction_status,
		};
	}

	async initializePayment(amount: number) {
		const walletTransaction = await PaymentDB.create({
			user: this.user,
			gross_amount: amount,
			transaction_status: WALLET_TRANSACTION_STATUS.PENDING,
			transaction_date: DateUtils.getDate(),
		});

		return {
			transaction_id: walletTransaction._id,
			gross_amount: walletTransaction.gross_amount,
			tax: walletTransaction.tax,
			discount: walletTransaction.discount,
			total_amount: walletTransaction.total_amount,
		};
	}

	async applyCoupon(id: Types.ObjectId, coupon: string) {
		const walletTransaction = await PaymentDB.findById(id);
		const couponDetails = await CouponDB.findOne({ code: coupon });

		if (walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND);
		} else if (couponDetails === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.COUPON_NOT_FOUND);
		}

		const coupon_applied_count = await PaymentDB.countDocuments({
			user: this.user,
			discount_coupon: couponDetails,
			transaction_status: WALLET_TRANSACTION_STATUS.SUCCESS,
		});

		if (
			coupon_applied_count >= couponDetails.no_of_coupons_per_user ||
			couponDetails.available_coupons <= 0
		) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.COUPON_EXPIRED);
		}

		walletTransaction.discount = couponDetails.discount_percentage * walletTransaction.gross_amount;
		couponDetails.available_coupons -= 1;

		await walletTransaction.save();
		await couponDetails.save();

		return {
			transaction_id: walletTransaction._id,
			gross_amount: walletTransaction.gross_amount,
			tax: walletTransaction.tax,
			discount: walletTransaction.discount,
			total_amount: walletTransaction.total_amount,
		};
	}

	async removeCoupon(id: Types.ObjectId) {
		const walletTransaction = await PaymentDB.findById(id);

		if (walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND);
		}

		const couponDetails = await CouponDB.findById(walletTransaction.discount_coupon);

		if (couponDetails !== null) {
			couponDetails.available_coupons += 1;
			await couponDetails.save();
		}

		walletTransaction.discount = 0;
		await walletTransaction.save();

		return {
			transaction_id: walletTransaction._id,
			gross_amount: walletTransaction.gross_amount,
			tax: walletTransaction.tax,
			discount: walletTransaction.discount,
			total_amount: walletTransaction.total_amount,
		};
	}

	async initializeRazorpayTransaction(id: Types.ObjectId) {
		const walletTransaction = await PaymentDB.findById(id);

		if (walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND);
		}

		const order = await RazorpayProvider.orders.createOrder({
			amount: walletTransaction.total_amount,
			reference_id: walletTransaction._id,
		});

		walletTransaction.reference_id = order.id;
		await walletTransaction.save();

		return {
			transaction_id: walletTransaction._id,
			order_id: order.id,
			razorpay_options: {
				description: 'Subscription',
				currency: order.currency,
				amount: order.amount * 100,
				name: 'Whatsapp Helper',
				order_id: order.id,
				prefill: {
					contact: this.user.phone,
				},
				key: '',
				theme: {
					color: '#4CB072',
				},
			},
		};
	}

	public async confirmTransaction(id: Types.ObjectId) {
		const walletTransaction = await PaymentDB.findById(id);

		if (walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}

		if (walletTransaction.transaction_status === WALLET_TRANSACTION_STATUS.SUCCESS) {
			return;
		}

		const orderStatus = await RazorpayProvider.orders.getOrderStatus(
			walletTransaction.reference_id
		);

		if (orderStatus !== 'paid') {
			throw new InternalError(INTERNAL_ERRORS.RAZORPAY_ERRORS.ORDER_PENDING);
		}

		walletTransaction.transaction_status = WALLET_TRANSACTION_STATUS.SUCCESS;
		await walletTransaction.save();
	}

	private static async isPaymentValid(user: IUser) {
		return (
			(await PaymentDB.exists({
				user,
				transaction_status: WALLET_TRANSACTION_STATUS.SUCCESS,
				expires_at: {
					$gte: DateUtils.getMomentNow().toDate(),
				},
			})) !== null
		);
	}

	async isSubscribed() {
		const isPaymentValid = await PaymentService.isPaymentValid(this.user);
		const isNew = DateUtils.getMoment(this.user.createdAt)
			.add(28, 'days')
			.isAfter(DateUtils.getMomentNow());
		return {
			isSubscribed: isPaymentValid,
			isNew: isNew,
		};
	}

	public async getPaymentRecords() {
		return PaymentDB.find({
			user: this.user,
		});
	}

	public async getRunningPayment() {
		return PaymentDB.findOne({
			user: this.user,
			transaction_status: WALLET_TRANSACTION_STATUS.SUCCESS,
			expires_at: {
				$gte: DateUtils.getMomentNow().toDate(),
			},
		});
	}
}

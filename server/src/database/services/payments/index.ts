import { UserDB } from '../../repository/user';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { IUser } from '../../../types/user';
import PaymentDB from '../../repository/payments';
import { WALLET_TRANSACTION_STATUS } from '../../../config/const';
import DateUtils from '../../../utils/DateUtils';
import RazorpayProvider from '../../../provider/razorpay';
import { Types } from 'mongoose';

export default class PaymentService {
	private user: IUser;
	private constructor(user: IUser) {
		this.user = user;
	}

	public static async getService(phone: string) {
		const user = await UserDB.findOne({ phone });
		if (user === null) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.NOT_FOUND);
		}
		return new PaymentService(user);
	}

	async initializePayment(amount: number) {
		const walletTransaction = await PaymentDB.create({
			user: this.user,
			amount: amount,
			transaction_status: WALLET_TRANSACTION_STATUS.PENDING,
			transaction_date: DateUtils.getDate(),
		});

		return walletTransaction._id;
	}

	async initializeTransaction(id: Types.ObjectId) {
		const walletTransaction = await PaymentDB.findById(id);

		if (walletTransaction === null) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}

		const order = await RazorpayProvider.orders.createOrder({
			amount: walletTransaction.total_amount,
			reference_id: walletTransaction._id,
		});

		await walletTransaction.save();

		return {
			transaction_id: walletTransaction._id,
			order_id: order.id,
			razorpay_options: {
				description: 'Subscription',
				currency: order.currency,
				amount: order.amount * 100,
				name: 'Maze',
				order_id: order.id,
				prefill: {
					contact: this.user.phone,
				},
				key: '',
				theme: {
					color: '#FFC371',
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
}

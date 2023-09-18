import mongoose, { Types } from 'mongoose';
import { IAuthDetail } from '../../../types/user';
import DateUtils from '../../../utils/DateUtils';

const authDetailSchema = new mongoose.Schema<IAuthDetail>(
	{
		user: {
			type: Types.ObjectId,
			ref: 'User',
			required: true,
		},
		client_id: {
			type: String,
			required: true,
			unique: true,
		},
		isRevoked: {
			type: Boolean,
			default: false,
		},
		revoke_at: {
			type: Date,
		},
		session_cleared: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

authDetailSchema.pre<IAuthDetail>('save', function (next) {
	if (!this.revoke_at) {
		this.revoke_at = DateUtils.getMomentNow().add(1, 'month').toDate();
	}
	next();
});

const AuthDetail = mongoose.model<IAuthDetail>('AuthDetail', authDetailSchema);
export default AuthDetail;

import RazorpayAPI from '../../config/RazorpayAPI';

type Props = {
	plan_id: string;
	offer_id?: string;
	email: string;
	phone: string;
	data?: { [key: string]: string };
};

async function createSubscription({ plan_id, email, phone, offer_id, data = {} }: Props) {
	const subscription = await RazorpayAPI.subscriptions.create({
		plan_id: plan_id,
		total_count: 60,
		notify_info: {
			notify_email: email,
			notify_phone: phone,
		},
		customer_notify: 1,
		quantity: 1,
		offer_id: offer_id,
		notes: data,
	});

	return {
		id: subscription.id,
		plan_id: subscription.plan_id,
		offer_id: subscription.offer_id,

		total_count: Number(subscription.total_count),
		remaining_count: Number(subscription.remaining_count),
		plan_count: Number(subscription.paid_count),

		short_url: subscription.short_url,
		status: subscription.status,
	};
}

async function resumeSubscription(subscription_id: string) {
	return await RazorpayAPI.subscriptions.resume(subscription_id, {
		resume_at: 'now',
	});
}
async function pauseSubscription(subscription_id: string) {
	return await RazorpayAPI.subscriptions.pause(subscription_id, {
		pause_at: 'now',
	});
}

async function getSubscription(subscription_id: string) {
	const subscription = await RazorpayAPI.subscriptions.fetch(subscription_id);

	return {
		id: subscription.id,
		plan_id: subscription.plan_id,
		offer_id: subscription.offer_id,

		total_count: Number(subscription.total_count),
		remaining_count: Number(subscription.remaining_count),
		plan_count: Number(subscription.paid_count),

		short_url: subscription.short_url,
		status: subscription.status,
	};
}

async function getSubscriptionStatus(subscription_id: string) {
	const subscription = await getSubscription(subscription_id);
	return subscription.status as
		| 'created'
		| 'authenticated'
		| 'active'
		| 'pending'
		| 'halted'
		| 'cancelled'
		| 'completed'
		| 'expired'
		| 'paused';
}

export default {
	createSubscription,
	getSubscription,
	getSubscriptionStatus,
	pauseSubscription,
	resumeSubscription,
};

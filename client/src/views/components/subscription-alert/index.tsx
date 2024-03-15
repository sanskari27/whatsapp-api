import { Alert, AlertIcon } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { StoreNames, StoreState } from '../../../store';

export default function SubscriptionPopup() {
	const { canSendMessage } = useSelector((state: StoreState) => state[StoreNames.USER]);
	return (
		<Alert hidden={canSendMessage} status='warning' rounded={'md'} my={2}>
			<AlertIcon />
			Seems this feature needs a subscription.
		</Alert>
	);
}

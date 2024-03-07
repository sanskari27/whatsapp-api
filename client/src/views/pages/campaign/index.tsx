import { Navigate, useOutlet } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';

export default function Campaign() {
	const outlet = useOutlet();

	if (outlet) {
		return outlet;
	}

	return <Navigate to={NAVIGATION.CAMPAIGNS + NAVIGATION.BULK_MESSAGING} />;
}

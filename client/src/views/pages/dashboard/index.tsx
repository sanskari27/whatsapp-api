import { Navigate, useOutlet } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';

export default function Dashboard() {
	const outlet = useOutlet();

	if (outlet) {
		return outlet;
	}

	return <Navigate to={NAVIGATION.DASHBOARD + NAVIGATION.CAMPAIGN_REPORTS} />;
}

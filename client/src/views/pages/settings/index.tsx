import { Navigate, useOutlet } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';

export default function Settings() {
	const outlet = useOutlet();

	if (outlet) {
		return outlet;
	}

	return <Navigate to={NAVIGATION.SETTINGS + NAVIGATION.PROFILES} />;
}

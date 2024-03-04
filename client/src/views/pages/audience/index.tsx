import { Navigate, useOutlet } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';

export default function Audience() {
	const outlet = useOutlet();

	if (outlet) {
		return outlet;
	}
	return <Navigate to={NAVIGATION.AUDIENCE + NAVIGATION.CSV} />;
}

import { Navigate, useOutlet } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';

export default function Media() {
	const outlet = useOutlet();

	if (outlet) {
		return outlet;
	}
	return <Navigate to={NAVIGATION.MEDIA + NAVIGATION.CONTACT} />;
}

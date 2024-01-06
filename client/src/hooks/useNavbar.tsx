import { ComponentWithAs, IconProps } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import { NAVIGATION } from '../config/const';

export type NavbarLocation = {
	title: string;
	icon?: string | ComponentWithAs<'svg', IconProps>;
	link?: string;
	actions?: React.ReactNode;
};

const initStatus: { locations: NavbarLocation[] } = { locations: [] };
let globalSet: React.Dispatch<
	React.SetStateAction<{
		locations: NavbarLocation[];
	}>
> = () => {
	throw new Error('you must useNavbar before setting its state');
};

export const useNavbar = singletonHook(initStatus, () => {
	const [navDetails, setNavDetails] = useState(initStatus);
	globalSet = setNavDetails;

	useEffect(() => {
		setNavDetails({
			locations: [
				{
					title: 'Whatsleads',
					link: NAVIGATION.HOME,
				},
			],
		});
	}, []);

	return { locations: navDetails.locations };
});

export const pushToNavbar = (data: NavbarLocation) => {
	globalSet((prev) => ({
		...prev,
		locations: [...prev.locations, data],
	}));
};

export const popFromNavbar = () => {
	globalSet((prev) => ({
		...prev,
		locations: prev.locations.slice(0, -1),
	}));
};

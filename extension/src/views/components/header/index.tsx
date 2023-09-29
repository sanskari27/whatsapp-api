import { Box, Image, Text } from '@chakra-ui/react';
import { LOGO, SETTINGS } from '../../../assets/Images';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';
import { CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../../../hooks/useAuth';

export default function Header() {
	const location = useLocation();
	const isSettingsPage = location.pathname === NAVIGATION.SETTINGS;
	const navigate = useNavigate();

	const { isAuthenticated } = useAuth();

	const handleSettingClicked = () => {
		if (isSettingsPage) {
			navigate(NAVIGATION.HOME);
		} else {
			navigate(NAVIGATION.SETTINGS);
		}
	};
	return (
		<Box width='full' height='full' display='flex' gap={'1rem'} alignItems='center'>
			<Image src={LOGO} width={9} />
			<Text className='text-black dark:text-white' flexGrow={1} fontSize={'lg'} fontWeight='bold'>
				Whatsapp Help
			</Text>
			{isAuthenticated ? (
				isSettingsPage ? (
					<CloseIcon
						width={4}
						height={4}
						className='! text-background-dark  dark:!text-background'
						onClick={handleSettingClicked}
						color={'inherit'}
					/>
				) : (
					<Image
						src={SETTINGS}
						width={4}
						height={4}
						className='invert dark:invert-0'
						onClick={handleSettingClicked}
					/>
				)
			) : null}
		</Box>
	);
}

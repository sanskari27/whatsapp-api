import { Box, Flex, Image, Progress, Text } from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate, useOutlet } from 'react-router-dom';
import { LOGO } from '../../../assets/Images';
import { NAVIGATION } from '../../../config/const';
import { useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import '../../../index.css';
import AttachmentService from '../../../services/attachment.service';
import AuthService from '../../../services/auth.service';
import BotService from '../../../services/bot.service';
import ContactCardService from '../../../services/contact-card.service';
import GroupService from '../../../services/group.service';
import LabelService from '../../../services/label.service';
import ShortenerService from '../../../services/shortener.service';
import UploadsService from '../../../services/uploads.service';
import { StoreNames, StoreState } from '../../../store';
import { setAttachments } from '../../../store/reducers/AttachmentReducers';
import { setBots } from '../../../store/reducers/BotReducers';
import { setCSVFileList } from '../../../store/reducers/CSVFileReducers';
import { setContactList } from '../../../store/reducers/ContactCardReducers';
import { setLinksList } from '../../../store/reducers/LinkShortnerReducers';
import { setMergedGroupList } from '../../../store/reducers/MergeGroupReducer';
import { setUserDetails } from '../../../store/reducers/UserDetailsReducers';
import Navbar from '../../components/navbar';
import NavigationDrawer from '../../components/navigation-drawer';

export default function Home() {
	const navigate = useNavigate();
	const status = useNetwork();
	const outlet = useOutlet();
	const dispatch = useDispatch();
	const { isAuthenticated, isAuthenticating } = useAuth();
	const { phoneNumber } = useSelector((state: StoreState) => state[StoreNames.USER]);
	useEffect(() => {
		if (status === 'NO-NETWORK') {
			navigate(NAVIGATION.NETWORK_ERROR);
		}
	}, [status, navigate]);

	const fetchUserDetails = useCallback(async () => {
		try {
			const promises = [
				AuthService.getUserDetails(),
				ContactCardService.ListContactCards(),
				AttachmentService.getAttachments(),
				UploadsService.listCSV(),
				GroupService.listGroups(),
				LabelService.listLabels(),
				BotService.listBots(),
				ShortenerService.listAll(),
				GroupService.mergedGroups(),
			];

			const results = await Promise.all(promises);

			dispatch(
				setUserDetails({
					...results[0],
					groups: results[4],
					labels: results[5],
					contactsCount: null,
				})
			);
			dispatch(setContactList(results[1]));
			dispatch(setAttachments(results[2]));
			dispatch(setCSVFileList(results[3]));
			dispatch(setBots(results[6]));
			dispatch(setLinksList(results[7]));
			dispatch(setMergedGroupList(results[8]));
		} catch (e) {
			navigate(NAVIGATION.WELCOME);
			return;
		}
	}, [dispatch, navigate]);

	useEffect(() => {
		if (phoneNumber) {
			return;
		}
		fetchUserDetails();
	}, [phoneNumber, fetchUserDetails]);

	if (isAuthenticating) {
		return (
			<Flex
				justifyContent={'center'}
				alignItems={'center'}
				direction={'column'}
				gap={'3rem'}
				width={'full'}
			>
				<Flex justifyContent={'center'} alignItems={'center'} width={'full'} gap={'1rem'}>
					<Image src={LOGO} width={'48px'} className='shadow-lg rounded-full' />
					<Text className='text-black dark:text-white' fontSize={'lg'} fontWeight='bold'>
						WhatsLeads
					</Text>
				</Flex>
				<Progress size='xs' isIndeterminate width={'30%'} rounded={'lg'} />
			</Flex>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to={NAVIGATION.WELCOME} />;
	}

	return (
		<Box width='full' className='custom-scrollbar'>
			<NavigationDrawer />
			<Navbar />
			<Box paddingLeft={'70px'} paddingTop={'70px'} overflowX={'hidden'} className='min-h-screen'>
				{outlet ? outlet : <Navigate to={NAVIGATION.CONTACT} />}
			</Box>
		</Box>
	);
}

import { Suspense, lazy } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { NAVIGATION } from './config/const';

import { Flex, Image, Progress, Text } from '@chakra-ui/react';
import { LOGO } from './assets/Images';
import { useNavbar } from './hooks/useNavbar';
import { useTheme } from './hooks/useTheme';
import PageWrapper from './views/components/page-wrapper';
const Welcome = lazy(() => import('./views/pages/welcome'));
const Scheduler = lazy(() => import('./views/pages/scheduler'));
const Bot = lazy(() => import('./views/pages/bot'));
const Home = lazy(() => import('./views/pages/home'));
const Report = lazy(() => import('./views/pages/report'));
const LinkShortner = lazy(() => import('./views/pages/link-shortner'));
const Contact = lazy(() => import('./views/pages/contacts'));
const Attachments = lazy(() => import('./views/pages/attachments'));
const CSVUpload = lazy(() => import('./views/pages/csv-upload'));
const PollReport = lazy(() => import('./views/pages/polls-report'));
const GroupLabelPage = lazy(() => import('./views/pages/group-label'));
const NetworkError = lazy(() => import('./views/pages/network-error'));

function App() {
	useTheme();
	useNavbar();
	return (
		<PageWrapper>
			<Router>
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route path={NAVIGATION.WELCOME} element={<Welcome />} />
						<Route path={NAVIGATION.HOME} element={<Home />}>
							<Route path={NAVIGATION.CONTACT} element={<Contact />} />
							<Route path={NAVIGATION.SCHEDULER} element={<Scheduler />} />
							<Route path={NAVIGATION.BOT} element={<Bot />} />
							<Route path={NAVIGATION.REPORTS} element={<Report />} />
							<Route path={NAVIGATION.SHORT} element={<LinkShortner />} />
							<Route path={NAVIGATION.ATTACHMENTS} element={<Attachments />} />
							<Route path={NAVIGATION.CSV} element={<CSVUpload />} />
							<Route path={NAVIGATION.POLL_RESPONSES} element={<PollReport />} />
							<Route path={NAVIGATION.GROUP_LABEL} element={<GroupLabelPage />} />
						</Route>
						<Route path={NAVIGATION.NETWORK_ERROR} element={<NetworkError />} />
						<Route path='*' element={<Navigate to={NAVIGATION.WELCOME} />} />
					</Routes>
				</Suspense>
			</Router>
		</PageWrapper>
	);
}

const Loading = () => {
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
};

export default App;

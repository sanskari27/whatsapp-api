import { Suspense, lazy } from 'react';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { Colors, NAVIGATION } from './config/const';

import { Flex, Image, Progress, Text } from '@chakra-ui/react';
import { LOGO } from './assets/Images';
import useUserData from './hooks/useUserData';
import Audience from './views/pages/audience';
import CSV from './views/pages/audience/csv';
import UploadCSV from './views/pages/audience/csv/upload-csv';
import Groups from './views/pages/audience/groups';
import ExportContacts from './views/pages/audience/groups/export-contacts';
import AttachmentDetails from './views/pages/media/attachments/attachment-details';
import Profiles from './views/pages/settings/profiles';

const Welcome = lazy(() => import('./views/pages/welcome'));
const Home = lazy(() => import('./views/pages/home'));
const Settings = lazy(() => import('./views/pages/settings'));

const Dashboard = lazy(() => import('./views/pages/dashboard'));
const CampaignReport = lazy(() => import('./views/pages/dashboard/campaign-report'));
const PollReport = lazy(() => import('./views/pages/dashboard/polls-report'));
const AutoResponderReport = lazy(() => import('./views/pages/dashboard/auto-responder-report'));
const DailyMessengerReport = lazy(() => import('./views/pages/dashboard/daily-messenger-report'));

const Campaign = lazy(() => import('./views/pages/campaign'));
const AutoResponder = lazy(() => import('./views/pages/campaign/auto-responder'));
const BulkMessaging = lazy(() => import('./views/pages/campaign/bulk-messaging'));
const DailyMessenger = lazy(() => import('./views/pages/campaign/daily-messenger'));

const Media = lazy(() => import('./views/pages/media'));
const ShortLinks = lazy(() => import('./views/pages/media/short-links'));
const LinkDetailsDialog = lazy(() => import('./views/pages/media/short-links/link-details'));
const Contacts = lazy(() => import('./views/pages/media/contacts'));
const ContactDetailsDialog = lazy(() => import('./views/pages/media/contacts/contact-details'));
const Attachments = lazy(() => import('./views/pages/media/attachments'));

const NetworkError = lazy(() => import('./views/pages/network-error'));

function App() {
	useUserData();

	return (
		<Flex minHeight={'100vh'} width={'100vw'} className='bg-background'>
			<Router>
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route path={NAVIGATION.WELCOME} element={<Welcome />} />
						<Route path={NAVIGATION.HOME} element={<Home />}>
							<Route path={NAVIGATION.DASHBOARD} element={<Dashboard />}>
								<Route
									path={NAVIGATION.CAMPAIGN_REPORTS.substring(1)}
									element={<CampaignReport />}
								/>
								<Route
									path={NAVIGATION.DAILY_MESSENGER.substring(1)}
									element={<DailyMessengerReport />}
								/>
								<Route
									path={NAVIGATION.AUTO_RESPONDER.substring(1)}
									element={<AutoResponderReport />}
								/>
								<Route path={NAVIGATION.POLL_RESPONSES.substring(1)} element={<PollReport />} />
							</Route>

							<Route path={NAVIGATION.CAMPAIGNS} element={<Campaign />}>
								<Route path={NAVIGATION.BULK_MESSAGING.substring(1)} element={<BulkMessaging />} />
								<Route
									path={NAVIGATION.DAILY_MESSENGER.substring(1)}
									element={<DailyMessenger />}
								/>
								<Route
									path={NAVIGATION.DAILY_MESSENGER.substring(1) + '/:id'}
									element={<DailyMessenger />}
								/>
								<Route path={NAVIGATION.AUTO_RESPONDER.substring(1)} element={<AutoResponder />} />
								<Route
									path={NAVIGATION.AUTO_RESPONDER.substring(1) + '/:id'}
									element={<AutoResponder />}
								/>
							</Route>

							<Route path={NAVIGATION.MEDIA} element={<Media />}>
								<Route path={NAVIGATION.CONTACT.substring(1)} element={<Contacts />}>
									<Route path=':id' element={<ContactDetailsDialog />} />
									<Route path='new' element={<ContactDetailsDialog />} />
								</Route>
								<Route path={NAVIGATION.SHORT_LINKS.substring(1)} element={<ShortLinks />}>
									<Route path=':id' element={<LinkDetailsDialog />} />
									<Route path='new' element={<LinkDetailsDialog />} />
								</Route>
								<Route path={NAVIGATION.ATTACHMENTS.substring(1)} element={<Attachments />}>
									<Route path=':id' element={<AttachmentDetails />} />
									<Route path='new' element={<AttachmentDetails />} />
								</Route>
							</Route>

							<Route path={NAVIGATION.AUDIENCE} element={<Audience />}>
								<Route path={NAVIGATION.CSV.substring(1)} element={<CSV />}>
									<Route path='upload-csv' element={<UploadCSV />} />
								</Route>
								<Route path={NAVIGATION.GROUP.substring(1)} element={<Groups />}>
									<Route
										path={NAVIGATION.EXPORT_CONTACTS.substring(1)}
										element={<ExportContacts />}
									/>
								</Route>
							</Route>

							<Route path={NAVIGATION.SETTINGS} element={<Settings />}>
								<Route path={NAVIGATION.PROFILES.substring(1)} element={<Profiles />} />
							</Route>
						</Route>

						<Route path={NAVIGATION.NETWORK_ERROR} element={<NetworkError />} />
						{/* <Route path='*' element={<Navigate to={NAVIGATION.WELCOME} />} /> */}
					</Routes>
				</Suspense>
			</Router>
		</Flex>
	);
}

const Loading = () => {
	return (
		<Flex
			direction={'column'}
			justifyContent={'center'}
			alignItems={'center'}
			flexDirection='column'
			width={'100vw'}
			height={'100vh'}
			bgColor={Colors.BACKGROUND_LIGHT}
		>
			<Flex
				direction={'column'}
				justifyContent={'center'}
				alignItems={'center'}
				flexDirection='column'
				padding={'3rem'}
				rounded={'lg'}
				width={'500px'}
				height={'550px'}
				className='border shadow-xl drop-shadow-xl '
			>
				<Flex justifyContent={'center'} alignItems={'center'} direction={'column'} gap={'3rem'}>
					<Flex justifyContent={'center'} alignItems={'center'} width={'full'} gap={'1rem'}>
						<Image src={LOGO} width={'48px'} className='shadow-lg rounded-full' />
						<Text className='text-primary-dark' fontSize={'lg'} fontWeight='bold'>
							WhatsLeads
						</Text>
					</Flex>
					<Progress size='xs' isIndeterminate width={'150%'} rounded={'lg'} />
				</Flex>
			</Flex>
		</Flex>
	);
};

export default App;

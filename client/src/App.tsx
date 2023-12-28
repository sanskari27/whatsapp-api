import { Suspense, lazy } from 'react';
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';
import './App.css';
import { NAVIGATION } from './config/const';

import { Flex, Image, Progress, Text } from '@chakra-ui/react';
import { LOGO } from './assets/Images';
import { useTheme } from './hooks/useTheme';
import PageWrapper from './views/components/page-wrapper';
const Welcome = lazy(() => import('./views/pages/welcome'));
const Exports = lazy(() => import('./views/pages/exporter'));
const Scheduler = lazy(() => import('./views/pages/scheduler'));
const Bot = lazy(() => import('./views/pages/bot'));
const Home = lazy(() => import('./views/pages/home'));
const Report = lazy(() => import('./views/pages/report'));
const LinkShortner = lazy(() => import('./views/pages/link-shortner'));

function App() {
    useTheme();

    return (
        <PageWrapper>
            <Router>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route
                            path={NAVIGATION.WELCOME}
                            element={<Welcome />}
                        />
                        <Route path={NAVIGATION.HOME} element={<Home />}>
                            <Route
                                path={NAVIGATION.EXPORTS}
                                element={<Exports />}
                            />
                            <Route
                                path={NAVIGATION.SCHEDULER}
                                element={<Scheduler />}
                            />
                            <Route path={NAVIGATION.BOT} element={<Bot />} />
                            <Route
                                path={NAVIGATION.REPORTS}
                                element={<Report />}
                            />
                            <Route
                                path={NAVIGATION.SHORT}
                                element={<LinkShortner />}
                            />
                        </Route>
                        {/* <Route path={NAVIGATION.SETTINGS} element={<Settings />} />
					<Route path={NAVIGATION.NETWORK_ERROR} element={<NetworkError />} /> */}
                        <Route
                            path="*"
                            element={<Navigate to={NAVIGATION.WELCOME} />}
                        />
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
            <Flex
                justifyContent={'center'}
                alignItems={'center'}
                width={'full'}
                gap={'1rem'}
            >
                <Image
                    src={LOGO}
                    width={'48px'}
                    className="shadow-lg rounded-full"
                />
                <Text
                    className="text-black dark:text-white"
                    fontSize={'lg'}
                    fontWeight="bold"
                >
                    WhatsLeads
                </Text>
            </Flex>
            <Progress size="xs" isIndeterminate width={'30%'} rounded={'lg'} />
        </Flex>
    );
};

export default App;

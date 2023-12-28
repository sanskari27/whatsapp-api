import { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { NAVIGATION } from './config/const';

import { Text } from '@chakra-ui/react';
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
					<Route path={NAVIGATION.NETWORK_ERROR} element={<NetworkError />} />
				<Route path='*' element={<Navigate to={NAVIGATION.WELCOME} />} /> */}
                    </Routes>
                </Suspense>
            </Router>
        </PageWrapper>
    );
}

const Loading = () => {
    return (
        <Text
            className="text-black dark:text-white animate-pulse"
            fontSize={'md'}
            fontWeight={'medium'}
            marginTop={'130px'}
            textAlign={'center'}
        >
            Loading...
        </Text>
    );
};

export default App;

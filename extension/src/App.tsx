import { useEffect, lazy, Suspense } from 'react';
import { Navigate, Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { NAVIGATION } from './config/const';

import ExtensionWrapper from './views/components/extension-wrapper';
import { Text } from '@chakra-ui/react';
const CheckoutPage = lazy(() => import('./views/pages/checkout'));
const Features = lazy(() => import('./views/pages/features'));
const Home = lazy(() => import('./views/pages/home'));
const Welcome = lazy(() => import('./views/pages/welcome'));
const Settings = lazy(() => import('./views/pages/settings'));

function App() {
	useEffect(() => {
		if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, []);

	return (
		<ExtensionWrapper>
			<Router>
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route path={NAVIGATION.WELCOME} element={<Welcome />} />
						<Route path={NAVIGATION.HOME} element={<Home />} />
						<Route path={NAVIGATION.FEATURES} element={<Features />} />
						<Route path={NAVIGATION.CHECKOUT} element={<CheckoutPage />} />
						<Route path={NAVIGATION.SETTINGS} element={<Settings />} />
						<Route path='*' element={<Navigate to={NAVIGATION.HOME} />} />
					</Routes>
				</Suspense>
			</Router>
		</ExtensionWrapper>
	);
}
const Loading = () => {
	return (
		<Text
			className='text-black dark:text-white animate-pulse'
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

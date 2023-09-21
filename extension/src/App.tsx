import { Navigate, Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { NAVIGATION } from './config/const';
import ExtensionWrapper from './views/components/extension-wrapper';
import Welcome from './views/pages/welcome';
import useToken from './hooks/useToken';
import { useEffect } from 'react';
import Home from './views/pages/home';

function App() {
	const { tokenVerified } = useToken();

	useEffect(() => {
		if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, []);

	if (tokenVerified) {
		// return <Navigate to={NAVIGATION.HOME} />;
	}

	return (
		<ExtensionWrapper>
			<Router>
				<Routes>
					<Route path={NAVIGATION.WELCOME} element={<Welcome />} />
					<Route path={NAVIGATION.HOME} element={<Home />} />

					<Route path='*' element={<Navigate to={NAVIGATION.WELCOME} />} />
				</Routes>
			</Router>
		</ExtensionWrapper>
	);
}

export default App;

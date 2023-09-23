
import { useEffect } from "react";
import {
    Navigate,
    Route,
    MemoryRouter as Router,
    Routes,
} from "react-router-dom";
import "./App.css";
import { NAVIGATION } from "./config/const";
import useToken from "./hooks/useToken";
import ExtensionWrapper from "./views/components/extension-wrapper";
import CheckoutPage from "./views/pages/checkout";
import Features from "./views/pages/features";
import Home from "./views/pages/home";
import Welcome from "./views/pages/welcome";


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
                    <Route path={NAVIGATION.FEATURES} element={<Features />} />
                    <Route
                        path={NAVIGATION.CHECKOUT}
                        element={<CheckoutPage />}
                    />
                    <Route
                        path="*"
                        element={<Navigate to={NAVIGATION.FEATURES} />}
                    />
                </Routes>
            </Router>
        </ExtensionWrapper>
    );
}

export default App;

import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useNavigate, useOutlet } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';
import { useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import '../../../index.css';
import AuthService from '../../../services/auth.service';
import { setUserDetails } from '../../../store/reducers/UserDetailsReducres';
import Navbar from '../../components/navbar';
import NavigationDrawer from '../../components/navigation-drawer';

export default function Home() {
    const navigate = useNavigate();
    const status = useNetwork();
    const outlet = useOutlet();
    const dispatch = useDispatch();
    const { isAuthenticated, isAuthenticating } = useAuth();

    useEffect(() => {
        if (status === 'NO-NETWORK') {
            navigate(NAVIGATION.NETWORK_ERROR);
        }
    }, [status, navigate]);
    useEffect(() => {
        AuthService.getUserDetails().then((res) => {
            if (res.name === '') {
                navigate(NAVIGATION.WELCOME);
                return;
            }
            dispatch(setUserDetails(res));
        });
    }, []);

    if (isAuthenticating) {
        return <Box>Loading</Box>;
    }

    if (!isAuthenticated) {
        return <Navigate to={NAVIGATION.WELCOME} />;
    }

    return (
        <Box width="full" className="custom-scrollbar">
            <NavigationDrawer />
            <Navbar />
            <Box paddingLeft={'70px'} paddingTop={'70px'} overflowX={'hidden'}>
                {outlet}
            </Box>
        </Box>
    );
}

import { Box, Flex, Image, Progress, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useNavigate, useOutlet } from 'react-router-dom';
import { LOGO } from '../../../assets/Images';
import { NAVIGATION } from '../../../config/const';
import { useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import '../../../index.css';
import AttachmentService from '../../../services/attachment.service';
import AuthService from '../../../services/auth.service';
import ContactCardService from '../../../services/contant-card.service';
import { setAttachments } from '../../../store/reducers/AttachmentReducers';
import { setContactList } from '../../../store/reducers/ContactCardReducers';
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
        ContactCardService.ListContactCards().then((res) => {
            dispatch(setContactList(res));
        });
        AttachmentService.getAttachments().then((res) => {
            dispatch(setAttachments(res));
        });
    }, [dispatch, navigate]);
    if (isAuthenticating) {
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
                <Progress
                    size="xs"
                    isIndeterminate
                    width={'30%'}
                    rounded={'lg'}
                />
            </Flex>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={NAVIGATION.WELCOME} />;
    }

    return (
        <Box width="full" className="custom-scrollbar">
            <NavigationDrawer />
            <Navbar />
            <Box
                paddingLeft={'70px'}
                paddingTop={'70px'}
                overflowX={'hidden'}
                className="min-h-screen"
            >
                {outlet}
            </Box>
        </Box>
    );
}

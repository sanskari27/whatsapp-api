import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate, useOutlet } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';
import { useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import '../../../index.css';
import Navbar from '../../components/navbar';
import NavigationDrawer from '../../components/navigation-drawer';

export default function Home() {
	const navigate = useNavigate();
	const status = useNetwork();
	const outlet = useOutlet();
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (status === 'NO-NETWORK') {
			navigate(NAVIGATION.NETWORK_ERROR);
		}
	}, [status, navigate]);
	useEffect(() => {
		if (!isAuthenticated) {
			navigate(NAVIGATION.WELCOME);
		}
	});

	return (
		<Box width='full' className='custom-scrollbar'>
			<NavigationDrawer />
			<Navbar />
			<Box paddingLeft={'70px'} paddingTop={'70px'}>
				{outlet}
			</Box>
			{/* <Header />

            <Tabs index={tabIndex} onChange={setTabIndex} pt={'1rem'} isLazy>
                <TabList
                    className="bg-[#ECECEC] border-[#ECECEC] dark:bg-[#3c3c3c] dark:!border-[#3c3c3c]"
                    rounded={'lg'}
                    padding={'0.25rem'}
                >
                    {TABS.map((tab, index) => (
                        <Tab
                            key={index}
                            width={'12.5%'}
                            padding={0}
                            rounded={'lg'}
                            isDisabled={tab.disabled}
                            _selected={{ width: '50%', bgColor: '#4CB072' }}
                            transition="0.3s"
                        >
                            <Box
                                width="full"
                                height="full"
                                rounded="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent={'center'}
                                gap={'0.5rem'}
                                padding={'0.5rem'}
                            >
                                <Icon
                                    as={tab.icon}
                                    color={
                                        tabIndex === index
                                            ? 'white'
                                            : 'green.400'
                                    }
                                    width={4}
                                />
                                {tabIndex === index ? (
                                    <Text
                                        textColor="white"
                                        fontSize={'sm'}
                                        fontWeight="bold"
                                        transition="0.3s"
                                    >
                                        {tab.name}
                                    </Text>
                                ) : null}
                            </Box>
                        </Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {TABS.map((tab, index) => (
                        <TabPanel key={index} padding={0}>
                            {tab.component}
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs> */}
		</Box>
	);
}

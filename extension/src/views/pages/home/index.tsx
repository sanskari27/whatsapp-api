import { Box, Icon, Image, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiFillEyeInvisible } from 'react-icons/ai';
import { BsBarChartFill } from 'react-icons/bs';
import { PiExportBold } from 'react-icons/pi';
import { SiProbot } from 'react-icons/si';
import { TbMessage2Minus } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { NAVIGATION } from '../../../config/const';
import { useNetwork } from '../../../hooks/useNetwork';
import Header from '../../components/header';
import Enhancements from '../enhancements';
import Exports from '../exports';
import Message from '../message';

const TABS = [
	{
		name: 'Privacy',
		icon: AiFillEyeInvisible,
		component: <Enhancements />,
		disabled: false,
	},
	{
		name: 'Exports',
		icon: PiExportBold,
		component: <Exports />,
		disabled: false,
	},

	{
		name: 'Message',
		icon: TbMessage2Minus,
		component: <Message />,
		disabled: false,
	},
	{
		name: 'Chat-Bot',
		icon: SiProbot,
		component: <div>CHAT_BOT</div>,
		disabled: false,
	},
	{
		name: 'Reports',
		icon: BsBarChartFill,
		component: <div>Report</div>,
		disabled: true,
	},
];

export default function Home() {
	const [tabIndex, setTabIndex] = useState(2);

	const navigate = useNavigate();
	const status = useNetwork();
	useEffect(() => {
		if (status === 'NO-NETWORK') {
			navigate(NAVIGATION.NETWORK_ERROR);
		}
	}, [status, navigate]);

	return (
		<Box width='full' py={'1rem'} px={'1rem'}>
			<Header />

			<Tabs index={tabIndex} onChange={setTabIndex} pt={'1rem'} isLazy>
				<TabList
					className='bg-[#ECECEC] border-[#ECECEC] dark:bg-[#3c3c3c] dark:!border-[#3c3c3c]'
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
							transition='0.3s'
						>
							<Box
								width='full'
								height='full'
								rounded='lg'
								display='flex'
								alignItems='center'
								justifyContent={'center'}
								gap={'0.5rem'}
								padding={'0.5rem'}
							>
								<Icon as={tab.icon} color={tabIndex === index ? 'white' : 'green.400'} width={4} />
								{tabIndex === index ? (
									<Text textColor='white' fontSize={'sm'} fontWeight='bold' transition='0.3s'>
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
			</Tabs>
		</Box>
	);
}

import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { AiFillEye } from 'react-icons/ai';
import { MessageProps } from '../../../background/background';
import { CHROME_ACTION, PRIVACY_TYPE } from '../../../config/const';
import { getActiveTabURL, getChromeData } from '../../../utils/ChromeUtils';
import CheckButton from '../../components/check-button';

const ENHANCEMENT = () => {
	const [privacy, setPrivacy] = useState({
		[PRIVACY_TYPE.RECENT]: false,
		[PRIVACY_TYPE.NAME]: false,
		[PRIVACY_TYPE.PHOTO]: false,
		[PRIVACY_TYPE.CONVERSATION]: false,
	});

	const { RECENT, NAME, PHOTO, CONVERSATION } = privacy;

	const fetchLocalData = useCallback(async () => {
		const promises = [
			getChromeData(PRIVACY_TYPE.RECENT),
			getChromeData(PRIVACY_TYPE.NAME),
			getChromeData(PRIVACY_TYPE.PHOTO),
			getChromeData(PRIVACY_TYPE.CONVERSATION),
		];
		const [recent, name, photo, conversation] = await Promise.all(promises);
		setPrivacy({
			[PRIVACY_TYPE.RECENT]: recent,
			[PRIVACY_TYPE.NAME]: name,
			[PRIVACY_TYPE.PHOTO]: photo,
			[PRIVACY_TYPE.CONVERSATION]: conversation,
		});
	}, []);

	useEffect(() => {
		fetchLocalData();
	}, [fetchLocalData]);

	const handleChange = async ({ name, value }: { name: string; value: boolean }) => {
		const activeTab = await getActiveTabURL();
		const message: MessageProps = {
			action: CHROME_ACTION.PRIVACY_UPDATED,
			tabId: activeTab.id,
			url: activeTab.url,
			data: {
				type: name,
				value,
			},
		};
		await chrome.runtime.sendMessage(message);
		setPrivacy((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	return (
		<Flex direction={'column'} gap={'0.5rem'}>
			<Flex alignItems='center' gap={'0.5rem'} mt={'1.5rem'}>
				<Icon as={AiFillEye} height={5} width={5} color={'green.400'} />
				<Text fontSize='md' className='text-black dark:text-white'>
					Privacy
				</Text>
			</Flex>
			<Box className='bg-[#ECECEC] dark:bg-[#535353]' p={'0.5rem'} borderRadius={'20px'}>
				<Flex flexDirection='column' gap={'0.5rem'}>
					<CheckButton
						name={PRIVACY_TYPE.RECENT}
						label='Blur Recent Messages'
						value={RECENT}
						onChange={handleChange}
					/>
					<CheckButton
						name={PRIVACY_TYPE.NAME}
						label='Blur Contact Name'
						value={NAME}
						onChange={handleChange}
					/>
					<CheckButton
						name={PRIVACY_TYPE.PHOTO}
						label='Blur Contact Photos'
						value={PHOTO}
						onChange={handleChange}
					/>
					<CheckButton
						name={PRIVACY_TYPE.CONVERSATION}
						label='Blur Conversation Message'
						value={CONVERSATION}
						onChange={handleChange}
					/>
				</Flex>
			</Box>
		</Flex>
	);
};

export default ENHANCEMENT;

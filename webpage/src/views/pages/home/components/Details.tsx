import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { ENHANCHMENT, EXPORT, REPORT } from '../../../../assets/Images';
import { THEME } from '../../../../utils/const';

export default function Details() {
	return (
		<>
			<Flex
				width={'full'}
				justifyContent={'center'}
				alignItems={'center'}
				direction={'column'}
				gap={'2rem'}
				mt={'2rem'}
			>
				<Text fontSize={'2xl'} textAlign={'center'} fontWeight={'medium'} py={'2rem'}>
					What is{' '}
					<Box as='span' color={THEME.THEME_GREEN}>
						WhatsLeads ?
					</Box>{' '}
					<Box
						color={'black'}
						fontSize={'xl'}
						maxWidth={'900px'}
						width={'90vw'}
						pb={'2rem'}
						pt={'1rem'}
					>
						Experience enhanced privacy and effortless contact management with our Chrome Extension
						designed for WhatsApp enthusiasts and businesses.
					</Box>
					<Box
						color={'black'}
						fontSize={'md'}
						fontWeight={'light'}
						maxWidth={'900px'}
						width={'90vw'}
					>
						Tailored for WhatsApp status influencers and businesses relying on WhatsApp for
						communication, WhatsLeads provides convenient features such as instant contact saving
						and comprehensive contact list export. Furthermore, it enhances privacy by offering an
						option to blur WhatsApp Web contents, including contact photos, names, and chats, adding
						an extra layer of confidentiality to your interactions while still saving you precious
						time.
					</Box>
				</Text>
			</Flex>
			<Flex
				className='flex-col md:flex-row'
				justifyContent={'center'}
				gap={'2rem'}
				alignItems={'center'}
				pt={'4rem'}
				id='features'
			>
				<Box>
					<Image width={'400px'} maxWidth={'350px'} src={ENHANCHMENT} alt='' />
				</Box>
				<Box className='w-full md:w-1/2'>
					<Text fontSize={'xl'} fontWeight={'medium'} className='text-center md:text-left'>
						Enhanced{' '}
						<Box as={'span'} color={THEME.THEME_GREEN}>
							{' '}
							Privacy Controls
						</Box>
					</Text>
					<Text className='text-center md:text-left'>
						Your Privacy, Your Way: Take charge of your WhatsApp Web experience with our privacy
						controls. Choose which elements to blur, including chat content, contact details, recent
						messages, contact names, and profile photos. Your privacy, your rules.
					</Text>
				</Box>
			</Flex>
			<Flex
				className='flex-col md:flex-row-reverse'
				justifyContent={'center'}
				gap={'2rem'}
				alignItems={'center'}
				pt={'4rem'}
			>
				<Box>
					<Image width={'400px'} maxWidth={'350px'} src={REPORT} alt='' />
				</Box>
				<Box className='w-full md:w-1/2'>
					<Box>
						<Text
							fontSize={'xl'}
							fontWeight={'medium'}
							className='text-center md:text-left'
							color={THEME.THEME_GREEN}
						>
							Export Contacts{' '}
							<Box as={'span'} color={'black'}>
								{' '}
								with Ease
							</Box>
						</Text>
					</Box>
					<Text className='text-center md:text-left'>
						Seamless Exporting: Export your contacts in a flash. With support for CSV and VCF
						formats, you have the flexibility to save your contacts the way you want. And the best
						part? There's no limit on the number of downloads.
					</Text>
				</Box>
			</Flex>
			<Flex
				className='flex-col md:flex-row'
				justifyContent={'center'}
				gap={'2rem'}
				alignItems={'center'}
				pt={'4rem'}
			>
				<Box>
					<Image width={'400px'} maxWidth={'350px'} src={EXPORT} alt='' />
				</Box>
				<Box className='w-full md:w-1/2'>
					<Box>
						<Text
							fontSize={'xl'}
							fontWeight={'medium'}
							className='text-center md:text-left'
							color={THEME.THEME_GREEN}
						>
							Unlimited number{' '}
							<Box as={'span'} color={'black'}>
								{' '}
								of downloads
							</Box>
						</Text>
					</Box>
					<Text className='text-center md:text-left'>
						Freedom to Export: Download your contacts without any restrictions. Let it be chat
						contact, group, or label. We’ve got you covered.
					</Text>
				</Box>
			</Flex>
		</>
	);
}

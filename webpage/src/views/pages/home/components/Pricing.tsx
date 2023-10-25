import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { THEME } from '../../../../utils/const';

export default function Pricing() {
	return (
		<Flex id='pricing' direction={'column'} py={'4rem'} px={'1rem'} alignItems={'center'}>
			<Text textAlign={'center'} fontSize={'2xl'} fontWeight={'medium'} pb={'2rem'}>
				<Box as={'span'} color={THEME.THEME_GREEN}>
					Simple Pricing{' '}
				</Box>
				For You
			</Text>
			<Flex
				className='flex-col md:flex-row w-11/12 justify-evenly gap-8 md:gap-0'
				boxShadow={'0px 0px 10px 5px rgba(0, 0, 0, 0.1)'}
				rounded={'2xl'}
				p={'2rem'}
				mb={'2rem'}
			>
				<Box textAlign={'center'}>
					<Text color={THEME.THEME_GREEN} fontSize={'2xl'} fontWeight={'medium'}>
						Free
					</Text>
					<Text color={'gray.400'} p={'0.25rem'}>
						Rs. 0/mo
					</Text>
					<Text fontSize={'sm'} pt={'0.25rem'}>
						Unlock Basic Privacy for
					</Text>
					<Text fontSize={'sm'} pb={'0.25rem'}>
						Free
					</Text>
					<Button
						backgroundColor={THEME.THEME_GREEN}
						color={'white'}
						rounded={'full'}
						_hover={{ backgroundColor: 'green.300' }}
						onClick={() => {
							window.open(
								'https://chrome.google.com/webstore/detail/whatsleads/fcgjgjellnemnioihojklppanoldamnd?hl=en-GB&authuser=0'
							);
						}}
					>
						Get Started For Free
					</Button>
				</Box>
				<Box>
					<Text
						className='text-center md:text-left'
						pb={'2rem'}
						color={THEME.THEME_GREEN}
						fontSize={'2xl'}
					>
						-Feature-
					</Text>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={'black'}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Blur Chat Content</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={'black'}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Blur Contact Names</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={'black'}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Blur Profile Photos</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={'black'}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Basic Privacy Controls</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={'black'}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>No Cost</Text>
					</Flex>
				</Box>
				<Box>
					<Text
						className='text-center md:text-left'
						pb={'2rem'}
						color={THEME.THEME_GREEN}
						fontSize={'2xl'}
					>
						-Benefits-
					</Text>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={'black'}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Protect your sensitive information</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={'black'}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Customize WhatsApp Web to your comfort level</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={'black'}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Experience enhanced privacy at no cost</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={'black'}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Ideal for individual users who value their privacy</Text>
					</Flex>
				</Box>
			</Flex>
			<Flex
				className='flex-col md:flex-row w-11/12 justify-evenly gap-8 md:gap-0'
				boxShadow={'0px 0px 10px 5px rgba(0, 0, 0, 0.1)'}
				rounded={'2xl'}
				p={'2rem'}
			>
				<Box textAlign={'center'}>
					<Text color={THEME.THEME_GREEN} fontSize={'2xl'} fontWeight={'medium'}>
						Free
					</Text>
					<Text color={'gray.400'} p={'0.25rem'}>
						Rs. 2500/mo
					</Text>
					<Text fontSize={'sm'} pt={'0.25rem'}>
						Upgrade To Premium
					</Text>
					<Text fontSize={'sm'} pb={'0.25rem'}>
						Privacy & Export
					</Text>
					<Button
						backgroundColor={'white'}
						color={'black'}
						rounded={'full'}
						borderColor={THEME.THEME_GREEN}
						borderWidth={'1px'}
						boxShadow={'0px 0px 10px 5px #0080001f'}
						mt={'1rem'}
						onClick={() => {
							window.open(
								'https://chrome.google.com/webstore/detail/whatsleads/fcgjgjellnemnioihojklppanoldamnd?hl=en-GB&authuser=0'
							);
						}}
					>
						Upgrade To Premium
					</Button>
				</Box>
				<Box>
					<Text
						className='text-center md:text-left'
						pb={'2rem'}
						color={THEME.THEME_GREEN}
						fontSize={'2xl'}
					>
						-Feature-
					</Text>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Blur Contact Names</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Blur Profile Photos</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Basic Privacy Controls</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Export Contacts (CSV/VCF)</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Unlimited Downloads</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							minWidth={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Ideal for Businesses and Power Users</Text>
					</Flex>
				</Box>
				<Box>
					<Text
						className='text-center md:text-left'
						pb={'2rem'}
						color={THEME.THEME_GREEN}
						fontSize={'2xl'}
					>
						-Benefits-
					</Text>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Take control of your privacy</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Streamline contact management</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Export contacts for business needs</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>No limits on downloads</Text>
					</Flex>
					<Flex className='items-start md:items-center'>
						{' '}
						<Box
							className='mt-2 md:mt-0 text-green-500'
							height={'5px'}
							width={'5px'}
							backgroundColor={THEME.THEME_GREEN}
							rounded={'full'}
							mr={'0.25rem'}
						/>
						<Text>Perfect for businesses and power users</Text>
					</Flex>
				</Box>
			</Flex>
		</Flex>
	);
}

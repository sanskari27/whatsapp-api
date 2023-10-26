import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BILLING_PLANS_TYPE, ROUTES } from '../../../../utils/const';

const Monthly = () => {
	const navigate = useNavigate();

	return (
		<HStack
			width={'full'}
			overflowX={'auto'}
			className='plan-wrapper'
			py={'3rem'}
			gap={'4rem'}
			alignItems={'start'}
		>
			<Box
				flexShrink={0}
				className='w-[85vw] ml-8 md:w-[400px] md:ml-20 max-w-[400px]'
				boxShadow={'0px 0px 10px 5px rgba(0,0,0,0.15)'}
				p={'2rem'}
				rounded={'xl'}
				borderWidth={'5px'}
				borderColor={'#D8D8D8'}
				_hover={{
					transform: 'scale(1.02)',
				}}
			>
				<Text
					textAlign={'center'}
					fontSize={'2xl'}
					fontWeight={'medium'}
					color={'#818181'}
					pb={'1rem'}
				>
					Silver
				</Text>
				<Text
					textAlign={'center'}
					fontSize={'lg'}
					fontWeight={'medium'}
					color={'#8E8E8E'}
					pb={'1rem'}
				>
					Rs. 1500/month
				</Text>
				<Text textAlign={'center'} fontSize={'md'} color={'#535353'}>
					Upgrade to Premium
				</Text>
				<Text textAlign={'center'} fontSize={'md'} color={'#535353'} pb={'1rem'}>
					Privacy & Export
				</Text>
				<Text textAlign={'left'} fontSize={'lg'} color={'#7D7D7D'} py={'1rem'}>
					-Feature-
				</Text>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Blur Chat Content</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Blur Contact Names</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Blur Profile Photos</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Basic Privacy Controls</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'#8C8C8C'} rounded={'full'} />
					<Text textAlign={'left'}>Export Contacts (CSV/VCF)</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'#8C8C8C'} rounded={'full'} />
					<Text>Unlimited Downloads</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'#8C8C8C'} rounded={'full'} />
					<Text textAlign={'left'}>Ideal for Businesses and Power Users</Text>
				</Flex>
				<Text textAlign={'left'} fontSize={'lg'} py={'1rem'} color={'#7D7D7D'}>
					-Benefits-
				</Text>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Take control of your privacy</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Streamline contact management</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Export contacts for business needs</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>No limits on downloads</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'#8C8C8C'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Perfect for businesses and power users</Text>
				</Flex>
				<Text
					textAlign={'center'}
					fontWeight={'bold'}
					fontSize={'3xl'}
					color={'#7d7d7d'}
					py={'2rem'}
				>
					Devices - 1
				</Text>
				<Button
					color={'black'}
					backgroundColor={'white'}
					borderWidth={'1px'}
					borderColor={'#818181'}
					boxShadow={'0px 0px 10px 5px #81818136'}
					onClick={() => navigate(`${ROUTES.PRICING}/${BILLING_PLANS_TYPE.SILVER_MONTH}`)}
				>
					Upgrade to Silver
				</Button>
			</Box>
			<Box
				flexShrink={0}
				boxShadow={'0px 0px 10px 5px rgba(0,0,0,0.15)'}
				p={'2rem'}
				rounded={'xl'}
				borderWidth={'5px'}
				className='w-[85vw] ml-8 md:w-[400px] md:ml-20 max-w-[400px]'
				borderColor={'#FFC327'}
				_hover={{
					transform: 'scale(1.02)',
				}}
			>
				<Text
					textAlign={'center'}
					fontSize={'2xl'}
					fontWeight={'medium'}
					color={'#FFC327'}
					pb={'1rem'}
				>
					Gold
				</Text>
				<Text
					textAlign={'center'}
					fontSize={'lg'}
					fontWeight={'medium'}
					color={'#8E8E8E'}
					pb={'1rem'}
				>
					Rs. 2500/month
				</Text>
				<Text textAlign={'center'} fontSize={'md'} color={'#535353'}>
					Upgrade to Premium
				</Text>
				<Text textAlign={'center'} fontSize={'md'} color={'#535353'} pb={'1rem'}>
					Privacy & Export
				</Text>
				<Text textAlign={'left'} fontSize={'lg'} color={'#FFC327'} py={'1rem'}>
					-Feature-
				</Text>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Blur Chat Content</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Blur Contact Names</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Blur Profile Photos</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Basic Privacy Controls</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'#8C8C8C'} rounded={'full'} />
					<Text textAlign={'left'}>Export Contacts (CSV/VCF)</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'#8C8C8C'} rounded={'full'} />
					<Text>Unlimited Downloads</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'#8C8C8C'} rounded={'full'} />
					<Text textAlign={'left'}>Ideal for Businesses and Power Users</Text>
				</Flex>
				<Text textAlign={'left'} fontSize={'lg'} py={'1rem'} color={'#FFC327'}>
					-Benefits-
				</Text>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Take control of your privacy</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Streamline contact management</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Export contacts for business needs</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>No limits on downloads</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'#8C8C8C'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Perfect for businesses and power users</Text>
				</Flex>
				<Text
					textAlign={'center'}
					fontWeight={'bold'}
					fontSize={'3xl'}
					color={'#FFC327'}
					py={'2rem'}
				>
					Devices - 2
				</Text>
				<Button
					color={'black'}
					backgroundColor={'white'}
					borderWidth={'1px'}
					borderColor={'#FFC327'}
					boxShadow={'0px 0px 10px 5px #ffc32736'}
					onClick={() => navigate(`${ROUTES.PRICING}/${BILLING_PLANS_TYPE.GOLD_MONTH}`)}
				>
					Upgrade to Gold
				</Button>
			</Box>
			<Box
				flexShrink={0}
				boxShadow={'0px 0px 10px 5px rgba(0,0,0,0.15)'}
				p={'2rem'}
				rounded={'xl'}
				borderWidth={'5px'}
				borderColor={'#FFB7B7'}
				mr={'5rem'}
				className='w-[85vw] ml-8 md:w-[400px] md:ml-20 max-w-[400px]'
				_hover={{
					transform: 'scale(1.02)',
				}}
			>
				<Text
					textAlign={'center'}
					fontSize={'2xl'}
					fontWeight={'medium'}
					color={'#FFC327'}
					pb={'1rem'}
				>
					Platinum
				</Text>
				<Text
					textAlign={'center'}
					fontSize={'lg'}
					fontWeight={'medium'}
					color={'#8E8E8E'}
					pb={'1rem'}
				>
					Rs. 3000/month
				</Text>
				<Text textAlign={'center'} fontSize={'md'} color={'#535353'}>
					Upgrade to Premium
				</Text>
				<Text textAlign={'center'} fontSize={'md'} color={'#535353'} pb={'1rem'}>
					Privacy & Export
				</Text>
				<Text textAlign={'left'} fontSize={'lg'} color={'#FFB7B7'} py={'1rem'}>
					-Feature-
				</Text>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Blur Chat Content</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Blur Contact Names</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Blur Profile Photos</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'black'} rounded={'full'} />
					<Text>Basic Privacy Controls</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'#8C8C8C'} rounded={'full'} />
					<Text textAlign={'left'}>Export Contacts (CSV/VCF)</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'#8C8C8C'} rounded={'full'} />
					<Text>Unlimited Downloads</Text>
				</Flex>
				<Flex alignItems='center' gap={2}>
					<Box height={'5px'} width={'5px'} backgroundColor={'#8C8C8C'} rounded={'full'} />
					<Text textAlign={'left'}>Ideal for Businesses and Power Users</Text>
				</Flex>
				<Text textAlign={'left'} fontSize={'lg'} py={'1rem'} color={'#FFB7B7'}>
					-Benefits-
				</Text>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Take control of your privacy</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Streamline contact management</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Export contacts for business needs</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'black'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>No limits on downloads</Text>
				</Flex>
				<Flex gap={2}>
					<Box
						height={'5px'}
						minWidth={'5px'}
						backgroundColor={'#8C8C8C'}
						rounded={'full'}
						mt={'0.6rem'}
					/>
					<Text textAlign={'left'}>Perfect for businesses and power users</Text>
				</Flex>
				<Text
					textAlign={'center'}
					fontWeight={'bold'}
					fontSize={'3xl'}
					color={'#FFB7B7'}
					py={'2rem'}
				>
					Devices - 4
				</Text>
				<Button
					color={'black'}
					backgroundColor={'white'}
					borderWidth={'1px'}
					borderColor={'#FFB7B7'}
					boxShadow={'0px 0px 10px 5px #bb252533'}
					onClick={() => navigate(`${ROUTES.PRICING}/${BILLING_PLANS_TYPE.PLATINUM_MONTH}`)}
				>
					Upgrade to Platinum
				</Button>
			</Box>
		</HStack>
	);
};
export default Monthly;

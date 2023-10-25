import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { THEME } from '../../../../utils/const';
import { RATING } from '../../../../assets/Images';

export default function Testimonial() {
	return (
		<Box>
			<Text textAlign={'center'} fontWeight={'medium'} fontSize={'xl'}>
				What Customers Love About WhatsLeads
			</Text>

			<Flex
				gap={'5rem'}
				justifyContent={'center'}
				alignItems={'center'}
				pt={'3rem'}
				className='flex-col md:flex-row'
				flexWrap={'wrap'}
			>
				<Flex
					direction={'column'}
					justifyContent={'space-between'}
					minWidth={'350px'}
					maxWidth={'400px'}
					width={'80vw'}
					boxShadow={'0px 0px 10px 5px #00000029'}
					rounded={'2xl'}
					p={'1rem'}
					height={'338px'}
				>
					<Box>
						<Flex width={'full'} justifyContent={'space-between'}>
							<Text fontWeight={'medium'}>
								Aniket{' '}
								<Box as='span' textColor={THEME.THEME_GREEN}>
									Bhoye
								</Box>{' '}
							</Text>
							<Image height={'15px'} src={RATING} alt='' />
						</Flex>
						<Text fontSize={'sm'} pt={'1rem'}>
							This extension is a perfect example of how simplicity can be powerful. I'm not a
							tech-savvy person, but I found the interface to be incredibly intuitive. The privacy
							settings are fantastic, and the unlimited downloads for contacts make it stand out.
							It's become an essential part of my WhatsApp Web experience. Thank you for making my
							life easier!
						</Text>
					</Box>
					<Text fontWeight={'medium'} textColor={THEME.THEME_GREEN} py={'1rem'}>
						Simple Yet Powerful
					</Text>
				</Flex>
				<Flex
					direction={'column'}
					justifyContent={'space-between'}
					minWidth={'350px'}
					maxWidth={'400px'}
					width={'80vw'}
					boxShadow={'0px 0px 10px 5px #00000029'}
					rounded={'2xl'}
					p={'1rem'}
					height={'338px'}
				>
					<Box>
						<Flex width={'full'} justifyContent={'space-between'}>
							<Text fontWeight={'medium'}>
								Gaurav{' '}
								<Box as='span' textColor={THEME.THEME_GREEN}>
									Maheshwari
								</Box>{' '}
							</Text>
							<Image height={'15px'} src={RATING} alt='' />
						</Flex>
						<Text fontSize={'sm'} pt={'1rem'}>
							As a business owner who uses WhatsApp for client communication, this extension has
							been a lifesaver. The ability to categorize and export contacts with ease has
							streamlined my workflow significantly. I can now find and reach out to clients
							quickly. It's user-friendly and has saved me a ton of time. Kudos to the developers
							for creating such a valuable tool!
						</Text>
					</Box>
					<Text fontWeight={'medium'} textColor={THEME.THEME_GREEN} py={'1rem'}>
						Effortless Contact Management
					</Text>
				</Flex>
				<Box
					minWidth={'350px'}
					maxWidth={'400px'}
					width={'80vw'}
					boxShadow={'0px 0px 10px 5px #00000029'}
					rounded={'2xl'}
					p={'1rem'}
				>
					<Flex width={'full'} justifyContent={'space-between'}>
						<Text fontWeight={'medium'}>
							Varshmaan{' '}
							<Box as='span' textColor={THEME.THEME_GREEN}>
								Sonkar
							</Box>{' '}
						</Text>
						<Image height={'15px'} src={RATING} alt='' />
					</Flex>

					<Text fontSize={'sm'} pt={'1rem'}>
						I stumbled upon this extension while searching for ways to enhance my privacy on
						WhatsApp Web, and I must say it's been a game-changer! The privacy controls allow me to
						blur chat content, contact names, and profile photos, giving me the peace of mind I
						need. Exporting contacts is a breeze, and the fact that there's no limit on downloads is
						a huge plus. Highly recommended for anyone who values their privacy and wants to
						simplify contact management!
					</Text>
					<Text fontWeight={'medium'} textColor={THEME.THEME_GREEN} py={'1rem'}>
						A Game Changer for WhatsApp Privacy
					</Text>
				</Box>
			</Flex>
		</Box>
	);
}

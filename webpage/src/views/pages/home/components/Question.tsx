import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Flex,
	Link,
	Text,
} from '@chakra-ui/react';
import { THEME } from '../../../../utils/const';

export default function Question() {
	return (
		<Flex
			className='flex-col md:flex-row items-center md:items-start'
			width={'full'}
			justifyContent={'center'}
			gap={'2rem'}
			id='faq'
		>
			<Box>
				<Text textAlign={'left'} fontSize={'2xl'} color={THEME.THEME_GREEN}>
					Have Some Question?
				</Text>
				<Text textAlign={'left'} fontSize={'lg'}>
					We've Got Answers
				</Text>
			</Box>
			<Accordion allowToggle width={'90vw'} maxW={'800px'}>
				<AccordionItem>
					<Text>
						<AccordionButton
							_expanded={{ color: THEME.THEME_GREEN }}
							_hover={{ bg: 'none' }}
							py={'1rem'}
						>
							<Box as='span' flex='1' textAlign='left'>
								Does WhatsLeads extension store my personal information?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</Text>
					<AccordionPanel pb={4} fontSize={'sm'}>
						No, WhatsLeads simply transfers data from Whatsapp Web and transfers it to your
						computer. Your personal data is not exposed to WhatsLeads or any third party.
					</AccordionPanel>
				</AccordionItem>

				<AccordionItem>
					<Text>
						<AccordionButton
							_expanded={{ color: THEME.THEME_GREEN }}
							_hover={{ bg: 'none' }}
							py={'1rem'}
						>
							<Box as='span' flex='1' textAlign='left'>
								Does this extension violate the Terms of Policy of Whatsapp?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</Text>
					<AccordionPanel pb={4} fontSize={'sm'}>
						No. Using our Chrome extension is in compliance with WhatsApp's Terms of Service.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<Text>
						<AccordionButton
							_expanded={{ color: THEME.THEME_GREEN }}
							_hover={{ bg: 'none' }}
							py={'1rem'}
						>
							<Box as='span' flex='1' textAlign='left'>
								Is it safe to scan my WhatsApp app on this extension?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</Text>
					<AccordionPanel pb={4} fontSize={'sm'}>
						You can trust WhatsLeads for a safe and secure experience. We scan to help you export
						contacts, all while ensuring your data protection. Your privacy is our priority.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<Text>
						<AccordionButton
							_expanded={{ color: THEME.THEME_GREEN }}
							_hover={{ bg: 'none' }}
							py={'1rem'}
						>
							<Box as='span' flex='1' textAlign='left'>
								Can I export contacts from any groups and labels?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</Text>
					<AccordionPanel pb={4} fontSize={'sm'}>
						Absolutely, you have the flexibility to export numbers from all your groups and labels
						or select specific groups and labels for contact export. Tailor it to your needs!
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<Text>
						<AccordionButton
							_expanded={{ color: THEME.THEME_GREEN }}
							_hover={{ bg: 'none' }}
							py={'1rem'}
						>
							<Box as='span' flex='1' textAlign='left'>
								What formats are supported while downloading contacts?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</Text>
					<AccordionPanel pb={4} fontSize={'sm'}>
						You have the choice to export in either CSV or VCF format, whichever suits your
						preferences.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<Text>
						<AccordionButton
							_expanded={{ color: THEME.THEME_GREEN }}
							_hover={{ bg: 'none' }}
							py={'1rem'}
						>
							<Box as='span' flex='1' textAlign='left'>
								Does WhatsLeads store my credit card or debit card information?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</Text>
					<AccordionPanel pb={4} fontSize={'sm'}>
						No, WhatsLeads processes all payments and credit card data through Razorpay, a secure
						3rd party service that protects all your data and transactions. WhatsLeads doesn’t store
						your payment information.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<Text>
						<AccordionButton
							_expanded={{ color: THEME.THEME_GREEN }}
							_hover={{ bg: 'none' }}
							py={'1rem'}
						>
							<Box as='span' flex='1' textAlign='left'>
								What payment methods do you accept?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</Text>
					<AccordionPanel pb={4} fontSize={'sm'}>
						We offer multiple payment options to cater to your convenience, including UPI, Internet
						Banking, Debit Card, Credit Card, and various wallets.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<Text>
						<AccordionButton
							_expanded={{ color: THEME.THEME_GREEN }}
							_hover={{ bg: 'none' }}
							py={'1rem'}
						>
							<Box as='span' flex='1' textAlign='left'>
								Can I change my number or get a refund?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</Text>
					<AccordionPanel pb={4} fontSize={'sm'}>
						Users are not able to change their subscribed numbers, and refunds are not provided.
						Please reach out to customer support for more help on this at{' '}
						<Link
							target='_blank'
							href='https://api.whatsapp.com/send/?phone=919654308000&text&type=phone_number&app_absent=0'
							color='green.400'
							_hover={{ color: 'green.300' }}
						>
							{' '}
							wa.me/9654308000
						</Link>
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</Flex>
	);
}

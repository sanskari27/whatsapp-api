import { LinkIcon } from '@chakra-ui/icons';
import {
	Button,
	Divider,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	FormControl,
	FormHelperText,
	FormLabel,
	HStack,
	Input,
	Text,
	Textarea,
	useDisclosure,
} from '@chakra-ui/react';
import { useTheme } from '@emotion/react';
import { forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ShortenerService from '../../../../services/shortener.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addShortenLink,
	setErrorGeneratingLink,
	setGenerated,
	setGeneratingLink,
	setLink,
	setMessage,
	setNumber,
} from '../../../../store/reducers/LinkShortnerReducers';

export type CreateLinkDrawerHandle = {
	open: () => void;
	close: () => void;
};

type CreateLinkDrawerProps = {
	onSuccess?: () => void;
};

const CreateLinkDrawer = forwardRef<CreateLinkDrawerHandle, CreateLinkDrawerProps>(
	(props: CreateLinkDrawerProps, ref) => {
		const { isOpen, onOpen, onClose } = useDisclosure();
		const theme = useTheme();
		const dispatch = useDispatch();

		useImperativeHandle(ref, () => ({
			open: () => {
				onOpen();
			},
			close: () => {
				onClose();
			},
		}));

		const {
			create_details: { link, message, number },
			generation_result: { error },
			ui: { generating_link, shortening_link },
		} = useSelector((state: StoreState) => state[StoreNames.LINK]);

		const generateQrCode = async (type: 'WHATSAPP' | 'LINK') => {
			if (type === 'WHATSAPP') {
				if (!number) {
					dispatch(setErrorGeneratingLink('NUMBER'));
					return;
				} else if (!message) {
					dispatch(setErrorGeneratingLink('MESSAGE'));
					return;
				}
			} else if (type === 'LINK' && !link) {
				dispatch(setErrorGeneratingLink('LINK'));
				return;
			}

			dispatch(setGeneratingLink(true));
			let data: {
				shorten_link: string;
				link: string;
				base64: string;
				id: string;
			} | null = null;
			if (type === 'WHATSAPP') {
				data = await ShortenerService.getShortenedURL(number, message);
			} else {
				data = await ShortenerService.createLink(link);
			}
			dispatch(setGeneratingLink(false));
			if (data === null) {
				dispatch(setErrorGeneratingLink("Couldn't generate link."));
				return;
			}
			dispatch(addShortenLink(data));
			dispatch(
				setGenerated({
					generated_link: data.shorten_link,
					generated_image: data.base64,
				})
			);
			onClose();
			props.onSuccess && props.onSuccess();
		};

		return (
			<Drawer isOpen={isOpen} placement='right' onClose={onClose} size={'lg'}>
				<DrawerOverlay />
				<DrawerContent backgroundColor={theme === 'dark' ? '#252525' : 'white'}>
					<DrawerCloseButton color={theme === 'dark' ? 'white' : 'black'} />
					<DrawerHeader textColor={theme === 'dark' ? 'white' : 'black'}>
						Shorten a Link
					</DrawerHeader>

					<DrawerBody>
						<Flex direction={'column'} alignSelf={'center'} gap={4} p={4} width={'full'} flex={1}>
							<FormControl isInvalid={error === 'NUMBER'}>
								<FormLabel textColor={theme === 'dark' ? 'white' : 'black'}>
									What's your number?
								</FormLabel>
								<Input
									placeholder='eg. 91'
									type='number'
									name='number'
									onChange={(e) => {
										dispatch(setNumber(e.target.value));
									}}
									value={number}
									textColor={theme === 'dark' ? 'white' : 'black'}
								/>
								<FormHelperText
									fontSize={'xs'}
									textColor={theme === 'dark' ? 'gray.400' : 'gray.600'}
								>
									Make sure you include the country code followed by the area code eg. for india 91,
									for UK 44
								</FormHelperText>
							</FormControl>
							<FormControl isInvalid={error === 'MESSAGE'}>
								<FormLabel textColor={theme === 'dark' ? 'white' : 'black'}>
									What message do you want your customer to see when they contact you?
								</FormLabel>
								<Textarea
									resize={'none'}
									name='message'
									onChange={(e) => {
										dispatch(setMessage(e.target.value));
									}}
									value={message}
									placeholder='Enter your message'
									textColor={theme === 'dark' ? 'white' : 'black'}
								/>
							</FormControl>
							<Button
								width={'full'}
								leftIcon={<LinkIcon />}
								colorScheme='whatsapp'
								onClick={() => generateQrCode('WHATSAPP')}
								isLoading={generating_link}
							>
								Create Link
							</Button>

							{!['', 'LINK', 'MESSAGE', 'NUMBER'].includes(error) && (
								<Text color={'tomato'}>{error}</Text>
							)}

							<HStack>
								<Divider />
								<Text textColor={theme === 'dark' ? 'white' : 'black'}>or</Text>
								<Divider />
							</HStack>
							<FormControl isInvalid={error === 'LINK'}>
								<FormLabel textColor={theme === 'dark' ? 'white' : 'black'}>
									Enter Link to Shorten
								</FormLabel>
								<Input
									placeholder='Enter Link'
									name='text'
									onChange={(e) => {
										dispatch(setLink(e.target.value));
									}}
									value={link}
									type='url'
									textColor={theme === 'dark' ? 'white' : 'black'}
								/>
							</FormControl>
							<Button
								isLoading={shortening_link}
								width={'full'}
								leftIcon={<LinkIcon />}
								colorScheme='whatsapp'
								onClick={() => generateQrCode('LINK')}
							>
								Shorten Link
							</Button>
						</Flex>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		);
	}
);

export default CreateLinkDrawer;

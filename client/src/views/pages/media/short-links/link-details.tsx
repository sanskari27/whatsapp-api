import { LinkIcon } from '@chakra-ui/icons';
import {
	AbsoluteCenter,
	Box,
	Button,
	Divider,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	Text,
	Textarea,
	VStack,
	useDisclosure,
	useToast,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import ShortenerService from '../../../../services/shortener.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addShortenLink,
	findLinkByID,
	reset,
	setErrorGeneratingLink,
	setGeneratingLink,
	setLink,
	setMessage,
	setNumber,
	setTitle,
	updateShortenLink,
} from '../../../../store/reducers/LinkShortnerReducers';

const LinkDetailsDialog = () => {
	const dispatch = useDispatch();
	const toast = useToast();
	const navigate = useNavigate();
	const { id } = useParams();
	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

	useEffect(() => {
		if (!id) return;
		dispatch(findLinkByID(id));
	}, [id, dispatch]);

	const handleClose = () => {
		dispatch(reset());
		navigate(NAVIGATION.MEDIA + NAVIGATION.SHORT_LINKS);
	};

	const {
		create_details: { link, message, number, title, id: _id },
		generation_result: { error },
		ui: { generating_link },
	} = useSelector((state: StoreState) => state[StoreNames.LINK]);
	const isUpdating = !!_id;

	const generateQrCode = async () => {
		if (title === '') {
			dispatch(setErrorGeneratingLink('TITLE'));
			return;
		}
		if (!link && !number && !message) {
			dispatch(setErrorGeneratingLink('LINK'));
			return;
		}

		let data: {
			shorten_link: string;
			link: string;
			base64: string;
			id: string;
			title: string;
		} | null = null;

		if (!link) {
			if (!number) {
				dispatch(setErrorGeneratingLink('NUMBER'));
				return;
			} else if (!message) {
				dispatch(setErrorGeneratingLink('MESSAGE'));
				return;
			}
			if (_id) {
				data = await ShortenerService.updateLink(_id, title, {
					number,
					message,
				});
			} else {
				data = await ShortenerService.getShortenedURL(number, message, title);
			}
		} else if (link) {
			if (_id) {
				data = await ShortenerService.updateLink(_id, title, { link });
			} else {
				data = await ShortenerService.createLink(title, link);
			}
		}
		dispatch(setGeneratingLink(true));
		dispatch(setGeneratingLink(false));

		if (data === null) {
			toast({
				title: 'Error',
				description: "Couldn't generate link.",
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}
		toast({
			title: 'Success',
			description: 'Link generated successfully',
			status: 'success',
			duration: 3000,
			isClosable: true,
		});
		if (_id) {
			dispatch(updateShortenLink({ id: _id, data }));
		} else {
			dispatch(addShortenLink(data));
		}
		// dispatch(
		// 	setGenerated({
		// 		generated_link: data.shorten_link,
		// 		generated_image: data.base64,
		// 	})
		// );
		handleClose();
	};

	return (
		<Drawer
			isOpen={isOpen}
			onClose={onClose}
			placement='right'
			size={'lg'}
			onCloseComplete={handleClose}
		>
			<DrawerOverlay />
			<DrawerContent textColor={Colors.PRIMARY_DARK} backgroundColor={Colors.BACKGROUND_LIGHT}>
				<DrawerCloseButton onClick={onClose} />
				<DrawerHeader>
					{isUpdating ? 'Update short link details' : 'Create a short link'}
				</DrawerHeader>

				<DrawerBody>
					<VStack width={'full'} alignItems={'stretch'} gap={'1rem'}>
						<TextInput
							onTextChange={(text) => dispatch(setTitle(text))}
							title='Link title'
							placeholder='eg. Contact card'
							value={title}
							isInvalid={error === 'TITLE'}
						/>
						<Text fontWeight={'medium'} fontSize={'lg'}>
							LInk Details
						</Text>
						<TextInput
							onTextChange={(text) => dispatch(setLink(text))}
							title='Enter Link to Shorten'
							placeholder='eg. https://www.google.com'
							value={link}
							isInvalid={error === 'LINK'}
						/>
						<Box position='relative'>
							<Divider height='2px' bgColor={'gray.300'} />
							<AbsoluteCenter color={'gray.800'}>
								<Text bgColor={'white'} px={'1rem'}>
									or
								</Text>
							</AbsoluteCenter>
						</Box>

						<TextInput
							onTextChange={(text) => dispatch(setNumber(text))}
							title={`What's your number?`}
							placeholder='eg. 91'
							value={number}
							isInvalid={error === 'NUMBER'}
							helper_text={`Make sure you include the country code followed by the area code eg. for India 91, for UK 44`}
						/>

						<FormControl isInvalid={error === 'MESSAGE'}>
							<FormLabel textColor={Colors.PRIMARY_DARK}>Enter message content</FormLabel>
							<Textarea
								resize={'none'}
								name='message'
								onChange={(e) => dispatch(setMessage(e.target.value))}
								value={message}
								placeholder='Enter your message'
								textColor={Colors.PRIMARY_DARK}
								borderColor={Colors.ACCENT_DARK}
								borderWidth={'1px'}
								padding={'0.5rem'}
							/>
						</FormControl>
						<Button
							width={'full'}
							leftIcon={<LinkIcon />}
							colorScheme='green'
							onClick={generateQrCode}
							isLoading={generating_link}
						>
							Save
						</Button>
					</VStack>
				</DrawerBody>
			</DrawerContent>
		</Drawer>
	);
};

export default LinkDetailsDialog;

function TextInput({
	onTextChange,
	title,
	placeholder,
	value,
	isInvalid,
	helper_text,
}: {
	isInvalid?: boolean;
	helper_text?: string;
	title: string;
	placeholder: string;
	onTextChange: (text: string) => void;
	value: string;
}) {
	return (
		<FormControl isInvalid={isInvalid}>
			<FormLabel textColor={Colors.PRIMARY_DARK}>{title}</FormLabel>
			<Input
				placeholder={placeholder}
				_placeholder={{
					color: Colors.ACCENT_DARK,
					opacity: 0.7,
				}}
				onChange={(e) => onTextChange(e.target.value)}
				value={value}
				textColor={Colors.PRIMARY_DARK}
				borderColor={Colors.ACCENT_DARK}
				borderWidth={'1px'}
				padding={'0.5rem'}
			/>
			{helper_text ? (
				<FormHelperText fontSize={'xs'} textColor={Colors.PRIMARY_DARK}>
					{helper_text}
				</FormHelperText>
			) : null}
		</FormControl>
	);
}

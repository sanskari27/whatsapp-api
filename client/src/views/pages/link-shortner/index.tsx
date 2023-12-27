import {
	Box,
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
	FormErrorMessage,
	FormHelperText,
	FormLabel,
	HStack,
	Icon,
	IconButton,
	Image,
	Input,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Textarea,
	Th,
	Thead,
	Tr,
	useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
// import TextToQR from '../../../helpers/qr-generator/textToQR';
import { CopyIcon, LinkIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import ShortenerService from '../../../services/shortener.service';
import { StoreNames, StoreState } from '../../../store';
import {
	addShortenLink,
	setGenerated,
	setGeneratingLink,
	setLink,
	setLinkCopied,
	setList,
	setMessage,
	setNumber,
	setShortingLink,
} from '../../../store/reducers/LinkShortnerReducers';
import GeneratedResultDialog from './components/generatedResultDialog';

const LinkShortner = () => {
	const dispatch = useDispatch();
	const theme = useTheme();
	const btnRef = useRef<HTMLButtonElement>(null);

	const {
		link,
		message,
		number,
		list,
		generatedImage,
		generatedLink,
		generatingLink,
		shorteningLink,
		linkCopied,
	} = useSelector((state: StoreState) => state[StoreNames.LINK]);

	// const [uiDetails, setUiDetails] = useState({
	// 	generatingLink: false,
	// 	shorteningLink: false,
	// 	linkCopied: false,
	// });

	const [error, setError] = useState({
		number: '',
		message: '',
		link: '',
		apiError: '',
	});

	const {
		isOpen: isLinkGenerated,
		onOpen: successfulLinkGenerated,
		onClose: closeGeneratedModal,
	} = useDisclosure();

	const {
		isOpen: createLink,
		onOpen: openLinkInputModal,
		onClose: closeLinkInputModal,
	} = useDisclosure();

	const generateQrCode = async () => {
		if (number === '') {
			setError((prev) => ({
				...prev,
				number: 'Please enter a valid number',
			}));
			return;
		}
		if (message === '') {
			setError((prev) => ({
				...prev,
				message: 'Please enter a valid message',
			}));
			return;
		}
		dispatch(setGeneratingLink(true));
		ShortenerService.getShortenedURL(number, message).then((data) => {
			dispatch(setGeneratingLink(false));
			if (!data) {
				setError((prev) => ({
					...prev,
					apiError: 'Something went wrong',
				}));
				return;
			}
			closeLinkInputModal();
			successfulLinkGenerated();
			dispatch(
				setGenerated({
					generatedLink: data.shorten_link,
					generatedImage: data.base64,
				})
			);

			dispatch(addShortenLink(data));
		});
	};

	const generateLinkToQR = async () => {
		if (link === '') {
			setError((prev) => ({
				...prev,
				link: 'Please enter a valid link',
			}));
			return;
		}
		dispatch(setShortingLink(true));

		const data = await ShortenerService.createLink(link);

		dispatch(setShortingLink(false));
		if (!data) {
			setError((prev) => ({
				...prev,
				apiError: 'Something went wrong',
			}));
			return;
		}
		dispatch(
			setGenerated({
				generatedLink: data.shorten_link,
				generatedImage: data.base64,
			})
		);

		successfulLinkGenerated();
		closeLinkInputModal();
		dispatch(addShortenLink(data));
	};

	useEffect(() => {
		ShortenerService.listAll().then((res) => {
			dispatch(setList(res));
		});
	}, [dispatch]);

	useEffect(() => {
		setTimeout(() => {
			dispatch(setLinkCopied(false));
		}, 5000);
	}, [linkCopied, dispatch]);

	return (
		<Box p={8}>
			<Drawer
				isOpen={createLink}
				placement='right'
				onClose={closeLinkInputModal}
				finalFocusRef={btnRef}
				size={'lg'}
			>
				<DrawerOverlay />
				<DrawerContent backgroundColor={theme === 'dark' ? '#252525' : 'white'}>
					<DrawerCloseButton color={theme === 'dark' ? 'white' : 'black'} />
					<DrawerHeader textColor={theme === 'dark' ? 'white' : 'black'}>
						Shorten a Link
					</DrawerHeader>

					<DrawerBody>
						<Flex direction={'column'} alignSelf={'center'} gap={4} p={4} width={'full'} flex={1}>
							<FormControl isInvalid={!!error.number}>
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
								<FormErrorMessage>{error.number}</FormErrorMessage>
							</FormControl>
							<FormControl isInvalid={!!error.message}>
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
								<FormErrorMessage>{error.message}</FormErrorMessage>
							</FormControl>
							<Button
								width={'full'}
								leftIcon={<LinkIcon />}
								colorScheme='whatsapp'
								onClick={generateQrCode}
								isLoading={generatingLink}
							>
								Create Link
							</Button>

							{error.apiError !== '' && <Text color={'tomato'}>{error.apiError}</Text>}

							<HStack>
								<Divider />
								<Text textColor={theme === 'dark' ? 'white' : 'black'}>or</Text>
								<Divider />
							</HStack>
							<FormControl isInvalid={!!error.link}>
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
								<FormErrorMessage>{error.link}</FormErrorMessage>
							</FormControl>
							<Button
								isLoading={shorteningLink}
								width={'full'}
								leftIcon={<LinkIcon />}
								colorScheme='whatsapp'
								onClick={generateLinkToQR}
							>
								Shorten Link
							</Button>
						</Flex>
					</DrawerBody>
				</DrawerContent>
			</Drawer>

			<TableContainer flex={2}>
				<HStack justifyContent={'space-between'}>
					<Text fontSize={'2xl'} textColor={theme === 'dark' ? 'white' : 'black'}>
						<Icon color={'green'} as={LinkIcon} mr={2} />
						Link Shortener
					</Text>
					<Button leftIcon={<LinkIcon />} colorScheme='whatsapp' onClick={openLinkInputModal}>
						Create a Link
					</Button>
				</HStack>
				<Table>
					<Thead>
						<Tr>
							<Th>Sl. no</Th>
							<Th>Qr Code</Th>
							<Th>link</Th>
							<Th>shorten link</Th>
							<Th>Action</Th>
						</Tr>
					</Thead>
					<Tbody>
						{list.map((item, index) => (
							<Tr key={index} textColor={theme === 'dark' ? 'white' : 'black'}>
								<Td>{index + 1}</Td>
								<Td>
									<Image src={item.base64} width={'150px'} />
								</Td>
								<Td>
									<Input value={item.link} isReadOnly size={'sm'} />
								</Td>
								<Td>
									<Input value={item.shorten_link} isReadOnly size={'sm'} />
								</Td>
								<Td>
									<IconButton
										backgroundColor={'transparent'}
										border={'none'}
										outline={'none'}
										_hover={{
											backgroundColor: 'transparent',
											border: 'none',
											outline: 'none',
										}}
										_active={{
											backgroundColor: 'gray.100',
											border: 'none',
											outline: 'none',
										}}
										aria-label='copy'
										icon={<Icon as={CopyIcon} />}
										onClick={() => {
											navigator.clipboard.writeText(item.link);
										}}
										color={theme === 'dark' ? 'white' : 'black'}
									/>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
			<GeneratedResultDialog
				isOpen={isLinkGenerated}
				onClose={closeGeneratedModal}
				image={generatedImage}
				link={generatedLink}
			/>
		</Box>
	);
};

export default LinkShortner;

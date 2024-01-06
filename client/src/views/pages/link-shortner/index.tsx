import {
	Box,
	Button,
	ComponentWithAs,
	Flex,
	HStack,
	Icon,
	IconButton,
	IconProps,
	Input,
	Skeleton,
	SkeletonCircle,
	SkeletonText,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
// import TextToQR from '../../../helpers/qr-generator/textToQR';
import { CopyIcon, DeleteIcon, EditIcon, LinkIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../config/const';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import ShortenerService from '../../../services/shortener.service';
import { StoreNames, StoreState } from '../../../store';
import {
	clearCreateDetails,
	deleteShortenLink,
	setLinkCopied,
	setList,
	setLoadingLinks,
	updateShortenLink,
} from '../../../store/reducers/LinkShortnerReducers';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
import QrImage from '../../components/qr-image';
import CreateLinkDrawer, { CreateLinkDrawerHandle } from './components/CreateLinkDrawer';
import EditLinkDialog, { EditLinkDialogHandle } from './components/editLinkDialog';
import GeneratedResultDialog from './components/generatedResultDialog';

const LinkShortner = () => {
	const dispatch = useDispatch();
	const theme = useTheme();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
	const editLinkDialogRef = useRef<EditLinkDialogHandle>(null);
	const drawerRef = useRef<CreateLinkDrawerHandle>(null);

	const {
		list,
		generation_result: { generated_image, generated_link },
		ui: { link_copied, loading_links },
	} = useSelector((state: StoreState) => state[StoreNames.LINK]);

	const {
		isOpen: isLinkGenerated,
		onOpen: successfulLinkGenerated,
		onClose: closeGeneratedModal,
	} = useDisclosure();

	useEffect(() => {
		pushToNavbar({
			title: 'Link Shortener',
			icon: LinkIcon,
			link: NAVIGATION.SHORT,
			actions: (
				<HStack>
					<Button
						leftIcon={<LinkIcon />}
						colorScheme='whatsapp'
						onClick={() => {
							dispatch(clearCreateDetails());
							drawerRef.current?.open();
						}}
					>
						Create a Link
					</Button>
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [dispatch]);

	const deleteLink = async (id: string) => {
		await ShortenerService.deleteLink(id);
		dispatch(deleteShortenLink(id));
	};

	const editLink = async (id: string, newLink: string) => {
		const data = await ShortenerService.updateLink(id, newLink);
		if (!data) {
			return;
		}
		dispatch(updateShortenLink({ id, data }));
	};

	useEffect(() => {
		dispatch(setLoadingLinks(true));
		ShortenerService.listAll()
			.then((res) => {
				dispatch(setList(res));
			})
			.finally(() => {
				dispatch(setLoadingLinks(false));
			});
	}, [dispatch]);

	useEffect(() => {
		setTimeout(() => {
			dispatch(setLinkCopied(false));
		}, 5000);
	}, [link_copied, dispatch]);

	return (
		<Box p={8}>
			<CreateLinkDrawer ref={drawerRef} onSuccess={() => successfulLinkGenerated()} />

			<TableContainer flex={2}>
				<Table>
					<Thead>
						<Tr>
							<Th>Sl. no</Th>
							<Th>Qr Code</Th>
							<Th>Title</Th>
							<Th>link</Th>
							<Th>shorten link</Th>
							<Th>Action</Th>
						</Tr>
					</Thead>
					<Tbody>
						{loading_links ? (
							<Tr
								bg={theme === 'light' ? 'gray.50' : 'gray.700'}
								color={theme === 'dark' ? 'white' : 'black'}
							>
								<Td>
									<SkeletonCircle size='10' />
								</Td>
								<Td>
									<Skeleton height='125px' width='125px' ml='1rem'>
										<Box>LOREM</Box>
									</Skeleton>
								</Td>
								<Td>
									<LineSkeleton />
								</Td>

								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<Flex>
										<BoxSkeleton />
										<BoxSkeleton />
										<BoxSkeleton />
									</Flex>
								</Td>
							</Tr>
						) : (
							list.map((item, index) => (
								<Tr key={index} textColor={theme === 'dark' ? 'white' : 'black'}>
									<Td>{index + 1}.</Td>
									<Td>
										<QrImage base64={item.base64} />
									</Td>
									<Td>{item.title ?? 'No title'}</Td>
									<Td>
										<Input value={item.link} isReadOnly size={'sm'} />
									</Td>
									<Td>
										<Input value={item.shorten_link} isReadOnly size={'sm'} />
									</Td>
									<Td>
										<ActionButton
											activeBackgroundColor='gray.100'
											icon={CopyIcon}
											onClick={() => navigator.clipboard.writeText(item.link)}
											color={theme === 'dark' ? 'white' : 'black'}
										/>
										<ActionButton
											activeBackgroundColor='yellow.100'
											icon={EditIcon}
											onClick={() => {
												editLinkDialogRef.current?.open({
													id: item.id,
													link: item.link,
													shortLink: item.shorten_link,
												});
											}}
											color={theme === 'dark' ? 'yellow.200' : 'yellow.500'}
										/>
										<ActionButton
											activeBackgroundColor='red.100'
											icon={DeleteIcon}
											onClick={() => {
												confirmationDialogRef.current?.open(item.id);
											}}
											color={'red.500'}
										/>
									</Td>
								</Tr>
							))
						)}
					</Tbody>
				</Table>
			</TableContainer>
			<GeneratedResultDialog
				isOpen={isLinkGenerated}
				onClose={closeGeneratedModal}
				image={generated_image}
				link={generated_link}
			/>
			<ConfirmationDialog ref={confirmationDialogRef} type={'Link'} onConfirm={deleteLink} />
			<EditLinkDialog ref={editLinkDialogRef} onConfirm={editLink} />
		</Box>
	);
};

type ActionButtonProps = {
	icon: ComponentWithAs<'svg', IconProps>;
	onClick: () => void;
	activeBackgroundColor: string;
	color: string;
};
function ActionButton({ icon, onClick, color, activeBackgroundColor }: ActionButtonProps) {
	return (
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
				backgroundColor: activeBackgroundColor,
				border: 'none',
				outline: 'none',
			}}
			aria-label='action-button'
			icon={<Icon as={icon} />}
			onClick={onClick}
			color={color}
		/>
	);
}

function LineSkeleton() {
	return <SkeletonText mt='4' noOfLines={1} spacing='4' skeletonHeight='4' rounded={'md'} />;
}

function BoxSkeleton() {
	return (
		<Skeleton height='15px' width='15px' ml='1rem'>
			<Box>LOREM</Box>
		</Skeleton>
	);
}

export default LinkShortner;

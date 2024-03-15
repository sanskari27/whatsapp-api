import { SearchIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Flex,
	Heading,
	Input,
	InputGroup,
	InputLeftElement,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Radio,
	RadioGroup,
	SkeletonText,
	Stack,
	Text,
	useBoolean,
	useDisclosure,
} from '@chakra-ui/react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import MapUtils from '../../../utils/MapUtils';

export type LocationInputDialogHandle = {
	open: () => void;
	close: () => void;
};

type Props = {
	onConfirm: (link: string) => void;
};

type ResolvePromise<T> = T extends Promise<infer U> ? U : T;
type ArrayElement<T> = T extends (infer U)[] ? U : T;
export type Place = ArrayElement<ResolvePromise<ReturnType<typeof MapUtils.listPlaces>>>;

const LocationInputDialog = forwardRef<LocationInputDialogHandle, Props>(
	({ onConfirm }: Props, ref) => {
		const [searchText, setSearchText] = useState<string>('');
		const [locations, setLocations] = useState<Place[]>([]);
		const [selectedLocation, setSelectedLocation] = useState<string>('');

		const queryString = useDebounce(searchText, 3000);

		const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
		const [isLoading, setLoading] = useBoolean(false);

		const onClose = () => {
			setSearchText('');
			closeModal();
		};

		const handleConfirm = () => {
			onConfirm(`www.google.com/maps/place/?q=place_id:${selectedLocation}`);
			onClose();
		};

		useImperativeHandle(ref, () => ({
			open: () => onOpen(),
			close: () => onClose(),
		}));

		useEffect(() => {
			if (queryString.length === 0) {
				setLoading.off();
				return setLocations([]);
			}
			MapUtils.listPlaces(queryString).then(setLocations).finally(setLoading.off);
		}, [queryString, setLoading]);
		useEffect(() => {
			setLoading.on();
		}, [searchText, setLoading]);

		return (
			<Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						<Box gap={'1rem'}>
							<Text>Search Places</Text>
							<InputGroup variant={'outline'}>
								<InputLeftElement pointerEvents='none'>
									<SearchIcon color='gray.300' />
								</InputLeftElement>
								<Input
									placeholder='Search here...'
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									borderRadius={'5px'}
									focusBorderColor='gray.300'
									color={'gray.600'}
								/>
							</InputGroup>
						</Box>
					</ModalHeader>
					<ModalBody>
						<Card size='xs' paddingY={'1rem'}>
							<CardHeader paddingX={'1rem'}>
								<Heading size='xs'>
									{queryString ? `Places for ~ ${queryString}` : 'Search for places'}
								</Heading>
							</CardHeader>

							<CardBody marginTop={'1rem'}>
								<Stack>
									<RadioGroup onChange={setSelectedLocation} value={selectedLocation}>
										{isLoading ? (
											<Box padding={2} rounded={'md'}>
												<Radio colorScheme='green' isChecked={false} isDisabled={true}>
													<SkeletonText size='sm' noOfLines={1} />
													<SkeletonText size='xs' noOfLines={1} />
												</Radio>
											</Box>
										) : locations.length > 0 ? (
											locations.map((location) => {
												return (
													<Box
														backgroundColor={
															selectedLocation === location.id ? 'green.100' : 'transparent'
														}
														key={location.id}
														padding={2}
														rounded={'md'}
													>
														<Radio value={location.id} colorScheme='green'>
															<Heading size='xs' textTransform='uppercase'>
																{location.display_name}
															</Heading>
															<Text fontSize='sm'>{location.address}</Text>
														</Radio>
													</Box>
												);
											})
										) : (
											<Box paddingX={4} rounded={'md'}>
												<Heading size='xs' textTransform='uppercase'>
													No Places Found
												</Heading>
											</Box>
										)}
									</RadioGroup>
								</Stack>
							</CardBody>
						</Card>
					</ModalBody>

					<ModalFooter>
						<Flex>
							<Button colorScheme='red' mr={3} onClick={onClose}>
								Cancel
							</Button>
							<Button colorScheme='green' onClick={handleConfirm}>
								Save
							</Button>
						</Flex>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
	}
);

export default LocationInputDialog;

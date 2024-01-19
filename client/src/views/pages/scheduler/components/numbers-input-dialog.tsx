import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalOverlay,
	Text,
	Textarea,
	VStack,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StoreNames, StoreState } from '../../../../store';
import { setNumbers } from '../../../../store/reducers/SchedulerReducer';

type Props = {
	isOpen: boolean;
	onClose: () => void;
};
export default function NumberInputDialog({ isOpen, onClose }: Props) {
	const {
		details: { numbers },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);
	const dispatch = useDispatch();

	const numbersCombined = useMemo(() => {
		if (!numbers || numbers.length === 0) {
			return '';
		}
		return numbers.join(', ');
	}, [numbers]);

	const handleChange = (text: string) => {
		const numbers = text.split(',').map((number) => number.trim());
		dispatch(setNumbers(numbers));
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'3xl'}>
			<ModalOverlay />
			<ModalContent>
				<ModalBody>
					<VStack>
						<Text alignSelf={'start'} pt={4}>
							Enter Recipients Number
						</Text>

						<Textarea
							width={'full'}
							minHeight={'200px'}
							size={'sm'}
							rounded={'md'}
							placeholder={'Enter recipients numbers separated by commas'}
							// border={'none'}
							_placeholder={{
								opacity: 0.4,
								color: 'inherit',
							}}
							_focus={{ border: 'none', outline: 'none' }}
							value={numbersCombined}
							onChange={(e) => handleChange(e.target.value)}
							resize={'vertical'}
						/>
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button colorScheme='green' variant='solid' width='full' onClick={onClose}>
						Done
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

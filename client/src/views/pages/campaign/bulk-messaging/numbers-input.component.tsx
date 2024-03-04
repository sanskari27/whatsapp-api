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
import { useEffect, useState } from 'react';
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

	const [numberInput, setNumberInput] = useState('');

	const handleClose = () => {
		const number = numberInput
			.split(',')
			.filter((number) => number && !isNaN(Number(number)))
			.map((number) => number.trim());
		dispatch(setNumbers(number));
		onClose();
		setNumberInput('');
	};

	useEffect(() => {
		if (!numbers) return;
		setNumberInput(numbers.join(', '));
	}, [numbers]);

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
							placeholder={
								'Enter recipients numbers separated by commas\nE.g. 91xxxxxxxxx8, 91xxxxxxxxx8'
							}
							_placeholder={{
								opacity: 0.7,
								color: 'inherit',
							}}
							_focus={{ border: 'none', outline: 'none' }}
							value={numberInput}
							onChange={(e) => setNumberInput(e.target.value)}
							resize={'vertical'}
						/>
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button colorScheme='green' variant='solid' width='full' onClick={handleClose}>
						Done
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

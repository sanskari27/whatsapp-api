import {
	Button,
	FormControl,
	FormLabel,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	Switch,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useSelector } from 'react-redux';
import GroupService from '../../../../services/group.service';
import LabelService from '../../../../services/label.service';
import { StoreNames, StoreState } from '../../../../store';

export type AssignLabelDialogHandler = {
	open: () => void;
	close: () => void;
};

const initState = {
	type: 'CSV',
	labels: [],
	label_id: '',
	groups: [],
	group_ids: [],
	csv_file: '',
	error: '',
	isBusinessAccount: true,
};

const AssignLabelDialog = forwardRef<AssignLabelDialogHandler>((_, ref) => {
	const { onOpen, onClose, isOpen } = useDisclosure();
	useImperativeHandle(ref, () => ({
		open: () => {
			setLabelDetails(initState);
			onOpen();
		},
		close: () => {
			onClose();
		},
	}));

	const [labelDetails, setLabelDetails] = useState(initState);

	const { list } = useSelector((state: StoreState) => state[StoreNames.CSV]);

	const handleChange = (
		name: string,
		value: boolean | string | string[] | { id: string; name: string }[]
	) => {
		setLabelDetails((prev) => ({
			...prev,
			error: '',
			[name]: value,
		}));
	};

	useEffect(() => {
		LabelService.listLabels()
			.then((list) => handleChange('labels', list))
			.catch((err) => {
				if (err === 'BUSINESS_ACCOUNT_REQUIRED') {
					handleChange('error', 'Business Account Required');
					handleChange('isBusinessAccount', false);
				}
			});
	}, []);

	useEffect(() => {
		if (labelDetails.type === 'GROUP' && labelDetails.groups.length === 0) {
			GroupService.listGroups().then((data) => handleChange('groups', data));
		}
	}, [labelDetails.type, labelDetails.groups]);

	const handleCreateLabel = () => {
		if (
			(labelDetails.type === 'CSV' && labelDetails.csv_file === '') ||
			(labelDetails.type === 'GROUP' && labelDetails.group_ids.length === 0)
		) {
			setLabelDetails((prev) => ({
				...prev,
				error: 'Please fill all the fields',
			}));
			return;
		}
		LabelService.assignLabel(labelDetails.type, labelDetails.label_id, {
			csv_file: labelDetails.csv_file,
			group_ids: labelDetails.group_ids,
		}).then((res) => {
			if (!res) {
				setLabelDetails((prev) => ({
					...prev,
					error: 'Something went wrong',
				}));
				return;
			} else {
				onClose();
			}
		});
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Assign Label</ModalHeader>
				<ModalBody>
					<FormControl>
						<FormLabel>Select Label to Assign</FormLabel>
						<Select
							className='!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full text-black dark:text-white '
							border={'none'}
							value={labelDetails.label_id}
							onChange={(e) => handleChange('label_id', e.target.value)}
						>
							<option
								className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
								value={''}
							>
								Select Label
							</option>
							{labelDetails.labels.map(({ id, name }) => (
								<option
									className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
									value={id}
									key={id}
								>
									{name}
								</option>
							))}
						</Select>
					</FormControl>
					<FormControl
						display='flex'
						alignItems='center'
						justifyContent={'center'}
						mt={'1rem'}
						gap={'0.5rem'}
					>
						<FormLabel htmlFor='csv-group' mb='0' mr='0'>
							Assign to CSV
						</FormLabel>
						<Switch
							id='csv-group'
							isChecked={labelDetails.type === 'GROUP'}
							onChange={(e) => handleChange('type', e.target.checked ? 'GROUP' : 'CSV')}
						/>
						<FormLabel htmlFor='csv-group' mb='0'>
							Assign to Groups
						</FormLabel>
					</FormControl>
					<FormControl mt={'1rem'}>
						<FormLabel>Select Recipients from CSV</FormLabel>
						<Select
							name={labelDetails.csv_file}
							onChange={(e) => handleChange('csvId', e.target.value)}
							disabled={labelDetails.type == 'GROUP'}
						>
							<option>Select CSV</option>
							{list.map((item) => (
								<option key={item.id} value={item.id}>
									{item.name}
								</option>
							))}
						</Select>
					</FormControl>
					<FormControl mt={'2rem'}>
						<FormLabel>Select Groups</FormLabel>
						<Multiselect
							disable={labelDetails.type == 'CSV'}
							displayValue='displayValue'
							placeholder={'Select Groups'}
							onRemove={(selectedList) =>
								handleChange(
									'group_ids',
									selectedList.map((group: { id: string }) => group.id)
								)
							}
							onSelect={(selectedList) => {
								handleChange(
									'group_ids',
									selectedList.map((group: { id: string }) => group.id)
								);
							}}
							showCheckbox={true}
							hideSelectedList={true}
							options={labelDetails.groups.map((item: { id: string; name: string }, index) => ({
								...item,
								displayValue: `${index + 1}. ${item.name}`,
							}))}
							style={{
								searchBox: {
									border: 'none',
								},
								inputField: {
									width: '100%',
								},
							}}
							className='  bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none '
						/>
					</FormControl>
				</ModalBody>

				<ModalFooter>
					{labelDetails.error && <Text color={'tomato'}>{labelDetails.error}</Text>}
					<Button colorScheme='red' mr={3} onClick={onClose}>
						Cancel
					</Button>
					<Button colorScheme='green' onClick={handleCreateLabel}>
						Create
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
});

export default AssignLabelDialog;

import {
	Box,
	Button,
	Checkbox,
	HStack,
	Icon,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { BiGroup, BiLabel } from 'react-icons/bi';
import { TbCsv } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../config/const';
import useFilteredList from '../../../hooks/useFilteredList';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import UploadsService from '../../../services/uploads.service';
import { StoreNames, StoreState } from '../../../store';
import {
	clearSelectedCSVFile,
	deleteSelectedCSVFile,
	setIsDeleting,
} from '../../../store/reducers/CSVFileReducers';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
import { NavbarDeleteElement, NavbarSearchElement } from '../../components/navbar';
import CSVNameInputDialog, { CSVNameInputDialogHandle } from './components/CSV-name-input-dialog';
import AssignLabelDialog, { AssignLabelDialogHandler } from './components/assign-label-dialog';
import CreateGroupDialog, { CreateGroupDialogHandler } from './components/create-group-dialog';

const CSVUpload = () => {
	const csvFileInputRef = useRef<CSVNameInputDialogHandle>(null);
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
	const createGroupDialogRef = useRef<CreateGroupDialogHandler>(null);
	const assignLabelDialogRef = useRef<AssignLabelDialogHandler>(null);

	const { list } = useSelector((state: StoreState) => state[StoreNames.CSV]);
	const { userType } = useSelector((state: StoreState) => state[StoreNames.USER]);

	const theme = useTheme();
	const dispatch = useDispatch();

	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

	const deleteCSVFile = () => {
		dispatch(setIsDeleting(true));
		selectedFiles.forEach(async (csv) => {
			UploadsService.deleteCSV(csv).then((res) => {
				if (!res) {
					return;
				}
				dispatch(deleteSelectedCSVFile({ _id: csv }));
			});
		});
		setSelectedFiles([]);
	};

	useEffect(() => {
		pushToNavbar({
			title: 'CSV Upload',
			icon: TbCsv,
			link: NAVIGATION.CSV,
			actions: (
				<HStack>
					<NavbarSearchElement />

					<Button
						size={'sm'}
						leftIcon={<BiGroup />}
						colorScheme='green'
						onClick={() => createGroupDialogRef.current?.open()}
					>
						GROUP
					</Button>
					{userType === 'BUSINESS' && (
						<Button
							size={'sm'}
							leftIcon={<BiLabel />}
							colorScheme='blue'
							onClick={() => assignLabelDialogRef.current?.open()}
						>
							LABEL
						</Button>
					)}
					<NavbarDeleteElement
						isDisabled={selectedFiles.length === 0}
						onClick={() => confirmationDialogRef.current?.open('')}
					/>
					<Button
						leftIcon={<Icon as={TbCsv} height={5} width={5} />}
						colorScheme={'green'}
						size={'sm'}
						onClick={() => {
							dispatch(clearSelectedCSVFile());
							csvFileInputRef.current?.open();
						}}
					>
						ADD
					</Button>
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [dispatch, selectedFiles.length, userType]);

	useEffect(() => {
		dispatch(clearSelectedCSVFile());
	}, [dispatch]);

	const filtered = useFilteredList(list, { name: 1 });

	return (
		<Box p={'1rem'} textColor={theme === 'dark' ? 'white' : 'black'}>
			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'5%'}>
								sl no
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'40%'}>
								CSV Name
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'50%'}>
								Headers
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{filtered.map((csv, index) => {
							return (
								<Tr key={index}>
									<Td>
										<Checkbox
											mr={'1rem'}
											isChecked={selectedFiles.includes(csv._id)}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedFiles((prev) => [...prev, csv._id]);
												} else {
													setSelectedFiles((prev) => prev.filter((file) => file !== csv._id));
												}
											}}
											colorScheme='green'
										/>
										{index + 1}.
									</Td>
									<Td>{csv.name}</Td>
									<Td>{csv.headers.join(', ')}</Td>
								</Tr>
							);
						})}
					</Tbody>
				</Table>
			</TableContainer>
			<CSVNameInputDialog ref={csvFileInputRef} />
			<ConfirmationDialog ref={confirmationDialogRef} onConfirm={deleteCSVFile} type={'CSV'} />
			<CreateGroupDialog ref={createGroupDialogRef} />
			{userType === 'BUSINESS' && <AssignLabelDialog ref={assignLabelDialogRef} />}
		</Box>
	);
};

export default CSVUpload;

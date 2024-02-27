import {
	Box,
	Checkbox,
	HStack,
	Icon,
	IconButton,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { IoIosCloudDownload } from 'react-icons/io';
import { TbCsv } from 'react-icons/tb';
import { NAVIGATION } from '../../../config/const';
import useFilteredList from '../../../hooks/useFilteredList';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import useTask from '../../../hooks/useTask';
import { useTheme } from '../../../hooks/useTheme';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
import { NavbarDeleteElement, NavbarSearchElement } from '../../components/navbar';

const Tasks = () => {
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

	const { tasks, removeTask, downloadTask } = useTask();

	const theme = useTheme();

	const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

	const deleteTasks = () => {
		selectedTasks.forEach(async (id) => {
			removeTask(id);
		});
		setSelectedTasks([]);
	};

	useEffect(() => {
		pushToNavbar({
			title: 'Background Tasks',
			icon: TbCsv,
			link: NAVIGATION.CSV,
			actions: (
				<HStack>
					<NavbarSearchElement />
					<NavbarDeleteElement
						isDisabled={selectedTasks.length === 0}
						onClick={() => confirmationDialogRef.current?.open('')}
					/>
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [selectedTasks.length]);

	const filtered = useFilteredList(tasks, { type: 1, data: 1 });

	return (
		<Box p={'1rem'} textColor={theme === 'dark' ? 'white' : 'black'}>
			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'5%'}>
								Sl no.
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'80%'}>
								Type
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'10%'}>
								Status
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'5%'}>
								Action
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{filtered.map((task, index) => {
							return (
								<Tr key={index}>
									<Td>
										<Checkbox
											mr={'1rem'}
											isChecked={selectedTasks.includes(task.id)}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedTasks((prev) => [...prev, task.id]);
												} else {
													setSelectedTasks((prev) => prev.filter((id) => id !== task.id));
												}
											}}
											colorScheme='green'
										/>
										{index + 1}.
									</Td>
									<Td className='capitalize'>{task.type.toLowerCase().split('_').join(' ')}</Td>
									<Td>{task.status}</Td>
									<Td>
										<IconButton
											aria-label='download file'
											icon={<Icon as={IoIosCloudDownload} height={5} width={5} />}
											onClick={() => downloadTask(task.id)}
										/>
									</Td>
								</Tr>
							);
						})}
					</Tbody>
				</Table>
			</TableContainer>
			<ConfirmationDialog
				ref={confirmationDialogRef}
				onConfirm={deleteTasks}
				type={'Background Task'}
			/>
		</Box>
	);
};

export default Tasks;

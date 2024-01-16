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
import { MdDelete } from 'react-icons/md';
import { TbCsv } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../config/const';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import UploadsService from '../../../services/uploads.service';
import { StoreNames, StoreState } from '../../../store';
import {
    clearSelectedCSVFile,
    deleteSelectedCSVFile,
    setIsDeleting,
} from '../../../store/reducers/CSVFileReducers';
import ConfirmationDialog, {
    ConfirmationDialogHandle,
} from '../../components/confirmation-alert';
import CSVNameInputDialog, {
    CSVNameInputDialogHandle,
} from './components/CSV-name-input-dialog';

const CSVUpload = () => {
    const csvFileInputRef = useRef<CSVNameInputDialogHandle>(null);
    const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

    const { list } = useSelector((state: StoreState) => state[StoreNames.CSV]);

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
                dispatch(deleteSelectedCSVFile({ id: csv }));
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
                    <Button
                        leftIcon={<Icon as={MdDelete} height={5} width={5} />}
                        colorScheme={'red'}
                        variant={'solid'}
                        size={'sm'}
                        isDisabled={selectedFiles.length === 0}
                        onClick={() => confirmationDialogRef.current?.open()}
                    >
                        Delete CSV
                    </Button>
                    <Button
                        leftIcon={<Icon as={TbCsv} height={5} width={5} />}
                        colorScheme={'green'}
                        variant={'solid'}
                        size={'sm'}
                        onClick={() => {
                            dispatch(clearSelectedCSVFile());
                            csvFileInputRef.current?.open();
                        }}
                    >
                        Add CSV
                    </Button>
                </HStack>
            ),
        });
        return () => {
            popFromNavbar();
        };
    }, [dispatch, selectedFiles.length]);

    useEffect(() => {
        dispatch(clearSelectedCSVFile());
    }, [dispatch]);

    return (
        <Box p={'1rem'} textColor={theme === 'dark' ? 'white' : 'black'}>
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th width={'5%'}>sl no</Th>
                            <Th width={'40%'}>CSV Name</Th>
                            <Th width={'50%'}>Headers</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {list.map((csv, index) => {
                            return (
                                <Tr key={index}>
                                    <Td>
                                        <Checkbox
                                            mr={'1rem'}
                                            isChecked={selectedFiles.includes(
                                                csv._id
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedFiles((prev) => [
                                                        ...prev,
                                                        csv._id,
                                                    ]);
                                                } else {
                                                    setSelectedFiles((prev) =>
                                                        prev.filter(
                                                            (file) =>
                                                                file !== csv._id
                                                        )
                                                    );
                                                }
                                            }}
                                            colorScheme="green"
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
            <ConfirmationDialog
                ref={confirmationDialogRef}
                onConfirm={deleteCSVFile}
                type={'CSV'}
            />
        </Box>
    );
};

export default CSVUpload;

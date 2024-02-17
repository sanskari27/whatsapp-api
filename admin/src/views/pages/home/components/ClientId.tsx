import {
	Card,
	CardBody,
	CardHeader,
	Editable,
	EditableInput,
	EditablePreview,
	HStack,
	Heading,
	IconButton,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../../hooks/useTheme';
import ClientIdService from '../../../../services/clientId.service';
import { StoreNames, StoreState } from '../../../../store';
import { setClientId } from '../../../../store/reducers/AdminReducers';

export default function Token() {
	const theme = useTheme();
	const dispatch = useDispatch();

	const { clientId } = useSelector((state: StoreState) => state[StoreNames.ADMIN]);

	useEffect(() => {
		ClientIdService.getClientID().then((res) => {
			dispatch(setClientId(res));
		});
	}, [dispatch]);

	const handleClick = () => {
		if (clientId !== '') ClientIdService.setClientID(clientId);
	};

	return (
		<Card maxW='250px' bgColor={theme === 'light' ? 'gray.100' : '#464343'}>
			<CardHeader pb={'0'}>
				<Heading size='md' textAlign={'center'} color={theme === 'light' ? 'gray.600' : 'gray.200'}>
					Client ID
				</Heading>
			</CardHeader>

			<CardBody>
				<HStack justifyContent={'space-between'} px={'1rem'}>
					<Heading size='xs' textTransform='uppercase'>
						<Editable
							border={`1px solid ${theme === 'light' ? 'black' : 'white'}`}
							width={'150px'}
							rounded={'md'}
							textAlign={'center'}
							defaultValue={clientId}
							value={clientId === '' ? 'No client id' : clientId}
							color={theme === 'light' ? 'black' : 'white'}
						>
							<EditablePreview />
							<EditableInput
								textColor={theme === 'light' ? 'black' : 'white'}
								value={clientId}
								textTransform={'uppercase'}
								onChange={(e) => dispatch(setClientId(e.target.value))}
							/>
						</Editable>
					</Heading>
					<IconButton aria-label='Edit Activation Code' icon={<FiSave />} onClick={handleClick} />
				</HStack>
			</CardBody>
		</Card>
	);
}

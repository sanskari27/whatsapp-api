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
import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { useTheme } from '../../../../hooks/useTheme';
import TokenService from '../../../../services/token.service';

export default function Token() {
	const theme = useTheme();
	const [token, setToken] = useState('');
	useEffect(() => {
		TokenService.getToken().then(setToken);
	}, []);

	const handleClick = () => {
		TokenService.setToken(token);
	};

	return (
		<Card maxW='250px' bgColor={theme === 'light' ? 'gray.100' : '#464343'}>
			<CardHeader pb={'0'}>
				<Heading size='md' textAlign={'center'} color={theme === 'light' ? 'gray.600' : 'gray.200'}>
					Activation Code
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
							defaultValue={token}
							value={token}
							color={theme === 'light' ? 'black' : 'white'}
						>
							<EditablePreview />
							<EditableInput
								textColor={theme === 'light' ? 'black' : 'white'}
								value={token}
								textTransform={'uppercase'}
								onChange={(e) => setToken(e.target.value)}
							/>
						</Editable>
					</Heading>
					<IconButton aria-label='Edit Activation Code' icon={<FiSave />} onClick={handleClick} />
				</HStack>
			</CardBody>
		</Card>
	);
}

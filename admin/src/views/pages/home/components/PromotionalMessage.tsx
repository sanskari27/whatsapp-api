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
	VStack,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../../hooks/useTheme';
import TokenService from '../../../../services/token.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	changePromotionalMessage,
	setPromotionalMessage,
} from '../../../../store/reducers/AdminReducers';

export default function PromotionalMessage() {
	const theme = useTheme();
	const dispatch = useDispatch();

	const {
		promotionalMessage: { message_1, message_2 },
	} = useSelector((state: StoreState) => state[StoreNames.ADMIN]);

	useEffect(() => {
		TokenService.getPromotionalMessage().then(({ message_1, message_2 }) => {
			dispatch(setPromotionalMessage({ message_1, message_2 }));
		});
	}, [dispatch]);

	const handleClick = () => {
		TokenService.setPromotionalMessage({
			message_1,
			message_2,
		});
	};

	return (
		<Card maxW='450px' bgColor={theme === 'light' ? 'gray.100' : '#464343'}>
			<CardHeader pb={'0'}>
				<Heading size='md' textAlign={'center'} color={theme === 'light' ? 'gray.600' : 'gray.200'}>
					Promotional Message Code
				</Heading>
			</CardHeader>

			<CardBody>
				<VStack gap={'0.5rem'}>
					<HStack justifyContent={'space-between'} px={'1rem'}>
						<Heading size='xs'>
							<Editable
								border={`1px solid ${theme === 'light' ? 'black' : 'white'}`}
								width={'350px'}
								rounded={'md'}
								textAlign={'center'}
								defaultValue={message_1}
								value={message_1}
								color={theme === 'light' ? 'black' : 'white'}
							>
								<EditablePreview />
								<EditableInput
									textColor={theme === 'light' ? 'black' : 'white'}
									value={message_1}
									onChange={(e) =>
										dispatch(changePromotionalMessage({ message_1: e.target.value, message_2 }))
									}
								/>
							</Editable>
						</Heading>
						<IconButton aria-label='Edit Activation Code' icon={<FiSave />} onClick={handleClick} />
					</HStack>
					<HStack justifyContent={'space-between'} px={'1rem'}>
						<Heading size='xs'>
							<Editable
								border={`1px solid ${theme === 'light' ? 'black' : 'white'}`}
								width={'350px'}
								rounded={'md'}
								textAlign={'center'}
								defaultValue={message_2}
								value={message_2}
								color={theme === 'light' ? 'black' : 'white'}
							>
								<EditablePreview />
								<EditableInput
									textColor={theme === 'light' ? 'black' : 'white'}
									value={message_2}
									onChange={(e) =>
										dispatch(changePromotionalMessage({ message_1, message_2: e.target.value }))
									}
								/>
							</Editable>
						</Heading>
						<IconButton
							aria-label='Edit Promotional Message'
							icon={<FiSave />}
							onClick={handleClick}
						/>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

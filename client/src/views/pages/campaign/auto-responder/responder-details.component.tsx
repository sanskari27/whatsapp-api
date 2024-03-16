import { CheckIcon } from '@chakra-ui/icons';
import { Flex, FormControl, FormLabel, IconButton, Select, Text, VStack } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../../config/const';
import { StoreNames, StoreState } from '../../../../store';
import {
	addDevice,
	removeDevice,
	setOptions,
	setRespondTo,
	setTrigger,
} from '../../../../store/reducers/BotReducers';
import ProfileSelector from '../../../components/profiles-selector';
import { TextAreaElement } from './inputs.components';

export default function CampaignDetails() {
	const {
		details: { trigger, devices },
		ui: { triggerError },
	} = useSelector((state: StoreState) => state[StoreNames.CHATBOT]);
	const dispatch = useDispatch();

	return (
		<VStack flex={1} gap={'0.5rem'}>
			<FormControl flex={1}>
				<FormLabel color={Colors.PRIMARY_DARK}>
					<Flex justifyContent={'space-between'} alignItems={'center'}>
						<Text color={Colors.PRIMARY_DARK}>Trigger</Text>
						<Flex gap={2} alignItems={'center'}>
							<IconButton
								isRound={true}
								variant='solid'
								aria-label='Done'
								size='xs'
								icon={!trigger ? <CheckIcon color='white' /> : <></>}
								onClick={() => dispatch(setTrigger(''))}
								className={`${
									!trigger ? '!bg-accent-dark' : '!bg-[#A6A6A6] '
								} hover:!bg-accent-dark `}
							/>
							<Text fontSize='sm' color={Colors.ACCENT_DARK}>
								Default Message
							</Text>
						</Flex>
					</Flex>
				</FormLabel>
				<TextAreaElement
					value={trigger ?? ''}
					onChange={(e) => dispatch(setTrigger(e.target.value))}
					isInvalid={!!triggerError}
					placeholder={'ex. hello'}
				/>
			</FormControl>
			<Flex width={'full'} gap='1rem'>
				<RecipientSelector />
				<ConditionSelector />
			</Flex>

			<ProfileSelector
				selectedProfiles={devices}
				onProfileSelected={(text) => dispatch(addDevice(text))}
				onProfileRemoved={(text) => dispatch(removeDevice(text))}
			/>
		</VStack>
	);
}

function RecipientSelector() {
	const dispatch = useDispatch();

	const { details } = useSelector((state: StoreState) => state[StoreNames.CHATBOT]);

	return (
		<FormControl flex={1}>
			<FormLabel color={Colors.PRIMARY_DARK}>Select audience</FormLabel>
			<Select
				bgColor={Colors.ACCENT_LIGHT}
				color={Colors.ACCENT_DARK}
				border={'none'}
				value={details.respond_to}
				onChange={(e) => dispatch(setRespondTo(e.target.value))}
			>
				<option value='ALL'>All</option>
				<option value='SAVED_CONTACTS'>Saved Contacts</option>
				<option value='NON_SAVED_CONTACTS'>Non Saved Contacts</option>
			</Select>
		</FormControl>
	);
}

function ConditionSelector() {
	const dispatch = useDispatch();

	const { details } = useSelector((state: StoreState) => state[StoreNames.CHATBOT]);

	return (
		<FormControl flex={1}>
			<FormLabel color={Colors.PRIMARY_DARK}>Activate if </FormLabel>
			<Select
				bgColor={Colors.ACCENT_LIGHT}
				color={Colors.ACCENT_DARK}
				border={'none'}
				value={details.options}
				onChange={(e) => dispatch(setOptions(e.target.value))}
			>
				<option value='INCLUDES_IGNORE_CASE'>Includes Ignore Case</option>
				<option value='INCLUDES_MATCH_CASE'>Includes Match Case</option>
				<option value='EXACT_IGNORE_CASE'>Exact Ignore Case</option>
				<option value='EXACT_MATCH_CASE'>Exact Match Case</option>
			</Select>
		</FormControl>
	);
}

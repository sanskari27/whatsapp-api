import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Select,
	Text,
	Textarea,
	VStack,
	useDisclosure,
} from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../../config/const';
import { StoreNames, StoreState } from '../../../../store';
import {
	setCSVFile,
	setCampaignName,
	setCampaignNameError,
	setDescription,
	setGroupRecipients,
	setLabelRecipients,
	setRecipientsError,
	setRecipientsFrom,
	setVariables,
} from '../../../../store/reducers/SchedulerReducer';
import NumberInputDialog from './numbers-input.component';

export default function CampaignDetails({
	fetchRecipients,
}: {
	fetchRecipients: (text: string) => void;
}) {
	const {
		details,
		ui: { campaignNameError },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);
	const dispatch = useDispatch();

	return (
		<VStack flex={1} gap={'0.5rem'}>
			<FormControl isInvalid={campaignNameError} flex={1}>
				<FormLabel color={Colors.PRIMARY_DARK}>Campaign name</FormLabel>
				<Input
					type='text'
					variant='unstyled'
					value={details.campaign_name}
					onChange={(e) => {
						dispatch(setCampaignNameError(false));
						dispatch(setCampaignName(e.target.value));
					}}
					placeholder='Give your campaign a name'
					_placeholder={{
						color: campaignNameError ? 'red.400' : Colors.ACCENT_DARK,
						opacity: 0.7,
					}}
					borderColor={campaignNameError ? 'red' : Colors.ACCENT_DARK}
					borderWidth={'1px'}
					padding={'0.5rem'}
				/>
			</FormControl>
			<FormControl>
				<FormLabel color={Colors.PRIMARY_DARK}>Description</FormLabel>
				<Textarea
					width={'full'}
					minHeight={'80px'}
					size={'sm'}
					rounded={'md'}
					placeholder={'Description for campaign'}
					borderColor={Colors.ACCENT_DARK}
					borderWidth={'1px'}
					_placeholder={{
						opacity: 0.7,
						color: Colors.ACCENT_DARK,
					}}
					_focus={{ border: 'none', outline: 'none' }}
					value={details.description ?? ''}
					onChange={(e) => dispatch(setDescription(e.target.value))}
				/>
			</FormControl>
			<RecipientFromSelector fetchRecipients={fetchRecipients} />
			<RecipientToSelector />
		</VStack>
	);
}

function RecipientFromSelector({ fetchRecipients }: { fetchRecipients: (text: string) => void }) {
	const dispatch = useDispatch();

	const { details } = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	const { userType } = useSelector((state: StoreState) => state[StoreNames.USER]);

	return (
		<FormControl flex={1}>
			<FormLabel color={Colors.PRIMARY_DARK}>Select audience</FormLabel>
			<Select
				bgColor={Colors.ACCENT_LIGHT}
				color={Colors.ACCENT_DARK}
				border={'none'}
				value={details.type}
				onChange={(e) => {
					dispatch(
						setRecipientsFrom(
							e.target.value as 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL'
						)
					);
					fetchRecipients(e.target.value);
				}}
			>
				<option
					className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
					value='NUMBERS'
				>
					Numbers
				</option>
				<option
					className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
					value='CSV'
				>
					CSV
				</option>
				<option
					className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
					value='GROUP'
				>
					Groups
				</option>
				<option
					className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
					value='GROUP_INDIVIDUAL'
				>
					Group Individuals
				</option>
				{userType === 'BUSINESS' ? (
					<option
						className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
						value='LABEL'
					>
						Labels
					</option>
				) : null}
			</Select>
		</FormControl>
	);
}

function RecipientToSelector() {
	const {
		isOpen: isNumberInputOpen,
		onOpen: openNumberInput,
		onClose: closeNumberInput,
	} = useDisclosure();

	const {
		details,
		recipients,
		isRecipientsLoading,
		ui: { recipientsError },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);
	const dispatch = useDispatch();

	const setSelectedRecipients = (ids: string[]) => {
		if (details.type === 'GROUP' || details.type === 'GROUP_INDIVIDUAL') {
			dispatch(setGroupRecipients(ids));
		} else if (details.type === 'LABEL') {
			dispatch(setLabelRecipients(ids));
		}
	};

	return (
		<FormControl
			alignItems='flex-end'
			justifyContent={'space-between'}
			width={'full'}
			flex={1}
			isInvalid={recipientsError}
		>
			{/* <FormLabel color={theme === 'dark' ? 'white' : 'GrayText'}>
				{details.type === 'NUMBERS' ? 'Selected Numbers' : 'Choose Existing Database'}
			</FormLabel> */}
			{details.type === 'CSV' ? (
				<Flex direction={'column'} gap={2}>
					<Select
						color={recipientsError ? 'red' : Colors.ACCENT_DARK}
						bgColor={Colors.ACCENT_LIGHT}
						border={'none'}
						value={details.csv_file}
						onChange={(e) => {
							dispatch(setRecipientsError(false));
							dispatch(setCSVFile(e.target.value));
							const recipient = recipients.find((recipient) => recipient.id === e.target.value);
							if (!recipient || !recipient.headers) return;
							if (recipient) dispatch(setVariables(recipient.headers));
						}}
					>
						<option
							value={'select'}
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
						>
							Select one!
						</option>
						{recipients.map(({ id, name }) => (
							<option
								className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
								value={id}
								key={id}
							>
								{name}
							</option>
						))}
					</Select>
				</Flex>
			) : details.type === 'NUMBERS' ? (
				<Flex direction={'column'} gap={2} justifyContent={'center'}>
					<Button
						variant={'unstyled'}
						onClick={openNumberInput}
						bgColor={Colors.ACCENT_LIGHT}
						_focus={{ border: 'none', outline: 'none' }}
						_active={{ border: 'none', outline: 'none' }}
						_hover={{ border: 'none', outline: 'none' }}
						borderColor={recipientsError ? 'red' : 'none'}
					>
						<Text color={recipientsError ? 'red' : Colors.ACCENT_DARK} fontWeight={'500'}>
							Selected Numbers ({details.numbers?.length ?? 0})
						</Text>
					</Button>
				</Flex>
			) : (
				<Multiselect
					disable={isRecipientsLoading}
					displayValue='displayValue'
					placeholder={
						details.type === 'GROUP'
							? 'Select Groups'
							: details.type === 'GROUP_INDIVIDUAL'
							? 'Select Groups'
							: details.type === 'LABEL'
							? 'Select Labels'
							: 'Select One!'
					}
					onRemove={(selectedList: { id: string }[]) =>
						setSelectedRecipients(selectedList.map((label) => label.id))
					}
					onSelect={(selectedList: { id: string }[]) => {
						dispatch(setRecipientsError(false));
						setSelectedRecipients(selectedList.map((label) => label.id));
					}}
					showCheckbox={true}
					hideSelectedList={true}
					options={recipients.map((item, index) => ({
						...item,
						displayValue: `${index + 1}. ${item.name}`,
					}))}
					style={{
						searchBox: {
							border: recipientsError ? '1px red solid' : 'none',
							backgroundColor: Colors.ACCENT_LIGHT,
							padding: '0.5rem 1rem',
						},
						inputField: {
							width: '100%',
							color: Colors.PRIMARY_DARK,
						},
						optionContainer: {
							backgroundColor: Colors.BACKGROUND_LIGHT,
						},
						option: { backgroundColor: Colors.BACKGROUND_LIGHT, color: Colors.PRIMARY_DARK },
					}}
					// className='  bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none '
				/>
			)}
			<NumberInputDialog isOpen={isNumberInputOpen} onClose={closeNumberInput} />
		</FormControl>
	);
}

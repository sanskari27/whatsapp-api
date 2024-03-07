import { Flex, FormControl, FormLabel, Input, Select, Textarea, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../../config/const';
import { StoreNames, StoreState } from '../../../../store';
import {
	setCSVFile,
	setCampaignName,
	setCampaignNameError,
	setDescription,
	setRecipientsError,
	setRecipientsFrom,
} from '../../../../store/reducers/SchedulerReducer';
import Each from '../../../../utils/Each';

export default function CampaignDetails({
	fetchRecipients,
	csv_only,
}: {
	fetchRecipients: (text: string) => void;
	csv_only?: boolean;
}) {
	const {
		details,
		ui: { campaignNameError },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!csv_only) {
			return;
		}
		dispatch(setRecipientsFrom('CSV'));
		fetchRecipients('CSV');
	}, [csv_only, dispatch, fetchRecipients]);

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

			<RecipientToSelector />
		</VStack>
	);
}

function RecipientToSelector() {
	const {
		details: { csv_file },
		ui: { recipientsError, editingMessage },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);
	const { list } = useSelector((state: StoreState) => state[StoreNames.CSV]);
	const dispatch = useDispatch();

	return (
		<FormControl
			alignItems='flex-end'
			justifyContent={'space-between'}
			width={'full'}
			flex={1}
			isInvalid={recipientsError}
		>
			<FormLabel color={Colors.PRIMARY_DARK}>Select audience</FormLabel>
			<Flex direction={'column'} gap={2}>
				<Select
					color={recipientsError ? 'red' : Colors.ACCENT_DARK}
					bgColor={Colors.ACCENT_LIGHT}
					disabled={editingMessage}
					border={'none'}
					value={csv_file}
					onChange={(e) => {
						dispatch(setRecipientsError(false));
						dispatch(setCSVFile(e.target.value));
					}}
				>
					<option
						value={'select'}
						className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
					>
						Select one!
					</option>
					<Each
						items={list}
						render={({ id, name }) => (
							<option
								className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
								value={id}
								key={id}
							>
								{name}
							</option>
						)}
					/>
				</Select>
			</Flex>
		</FormControl>
	);
}

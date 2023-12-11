import { Box, Flex, FormControl, FormLabel, Heading, Input, Select } from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GroupService from '../../../services/group.service';
import LabelService from '../../../services/label.service';
import UploadsService from '../../../services/uploads.service';
import { StoreNames, StoreState } from '../../../store';
import {
	setBusinessAccount,
	setRecipients,
	setRecipientsFrom,
	setRecipientsLoading,
} from '../../../store/reducers/SchedulerReducer';

export type SchedulerDetails = {
	type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
	numbers?: string[];
	csv_file: string;
	group_ids: string[];
	label_ids: string[];
	message: string;
	variables: string[];
	shared_contact_cards: {
		first_name?: string;
		middle_name?: string;
		last_name?: string;
		organization?: string;
		email_personal?: string;
		email_work?: string;
		contact_number_phone?: string;
		contact_number_work?: string;
		contact_number_other?: string[];
		links?: string[];
		street?: string;
		city?: string;
		state?: string;
		country?: string;
		pincode?: string;
	}[];
	attachments: string[];
	campaign_name: string;
	min_delay: number;
	max_delay: number;
	startTime: string;
	endTime: string;
	batch_delay: number;
	batch_size: number;
};

export default function Scheduler() {
	const dispatch = useDispatch();
	const { details, isBusinessAccount } = useSelector(
		(state: StoreState) => state[StoreNames.SCHEDULER]
	);

	const fetchRecipients = useCallback(
		function (type: string) {
			dispatch(setRecipientsLoading(true));
			if (type === 'GROUP') {
				GroupService.listGroups()
					.then((data) => dispatch(setRecipients(data)))
					.finally(() => {
						dispatch(setRecipientsLoading(false));
					});
			} else if (type === 'GROUP_INDIVIDUAL') {
				GroupService.listGroups()
					.then((data) => dispatch(setRecipients(data)))
					.finally(() => {
						dispatch(setRecipientsLoading(false));
					});
			} else if (type === 'LABEL') {
				LabelService.listLabels()
					.then((data) => dispatch(setRecipients(data)))
					.catch((err) => {
						if (err === 'BUSINESS_ACCOUNT_REQUIRED') {
							dispatch(setRecipientsFrom('NUMBERS'));
							dispatch(setBusinessAccount(false));
						}
					})
					.finally(() => {
						dispatch(setRecipientsLoading(false));
					});
			} else if (type === 'CSV') {
				UploadsService.listCSV()
					.then((data) => dispatch(setRecipients(data)))
					.finally(() => {
						dispatch(setRecipientsLoading(false));
					});
			}
		},
		[dispatch]
	);

	useEffect(() => {
		fetchRecipients(details.type);
	}, [fetchRecipients, details.type]);

	return (
		<Box padding={'1rem'}>
			<Flex direction={'column'}>
				<Heading fontSize={'large'} fontWeight={'medium'}>
					Campaign Details
				</Heading>
				<Box marginTop={'1rem'}>
					<Flex>
						<FormControl>
							<FormLabel>Campaign Name</FormLabel>
							<Input type='email' />
						</FormControl>
						<FormControl>
							<FormLabel>Recipients From</FormLabel>
							<Select
								className={`!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full ${
									details.type ? ' text-black dark:text-white' : ' text-gray-700 dark:text-gray-400'
								}`}
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
								{isBusinessAccount ? (
									<option
										className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
										value='LABEL'
									>
										Labels
									</option>
								) : null}
							</Select>
						</FormControl>
					</Flex>
				</Box>
			</Flex>
		</Box>
	);
}

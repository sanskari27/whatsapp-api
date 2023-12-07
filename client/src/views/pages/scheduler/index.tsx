import { Box, Flex, FormControl, FormLabel, Heading, Input, Select } from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import GroupService from '../../../services/group.service';
import { StoreNames, StoreState } from '../../../store';

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
	const theme = useTheme();

	const { isRecipientsLoading, details } = useSelector(
		(state: StoreState) => state[StoreNames.SCHEDULER]
	);

	const handleChange = useCallback(function (name: keyof SchedulerDetails, value: string | number) {
		setDetails((prev) => ({ ...prev, [name]: value }));
	}, []);

	const fetchRecipients = useCallback(
		function (type: string) {
			setUIDetails((prevState) => ({
				...prevState,
				recipientsLoading: true,
			}));
			if (type === 'GROUP') {
				GroupService.listGroups()
					.then(setRecipientsOptions)
					.finally(() => {
						setUIDetails((prevState) => ({
							...prevState,
							recipientsLoading: false,
						}));
					});
			} else if (type === 'GROUP_INDIVIDUAL') {
				GroupService.listGroups()
					.then(setRecipientsOptions)
					.finally(() => {
						setUIDetails((prevState) => ({
							...prevState,
							recipientsLoading: false,
						}));
					});
			} else if (type === 'LABEL') {
				LabelService.listLabels()
					.then(setRecipientsOptions)
					.catch((err) => {
						if (err === 'BUSINESS_ACCOUNT_REQUIRED') {
							handleChange({ name: 'type', value: 'NUMBERS' });
							setUIDetails((prevState) => ({
								...prevState,
								isBusiness: false,
							}));
						}
					})
					.finally(() => {
						setUIDetails((prevState) => ({
							...prevState,
							recipientsLoading: false,
						}));
					});
			} else if (type === 'CSV') {
				UploadsService.listCSV()
					.then(setRecipientsOptions)
					.finally(() => {
						setUIDetails((prevState) => ({
							...prevState,
							recipientsLoading: false,
						}));
					});
			}
		},
		[handleChange]
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
									handleChange('type', e.target.value);
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
								{isBusiness ? (
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

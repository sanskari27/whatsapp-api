import { Box, FormControl, FormErrorMessage, Input, Select, Text } from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import { useState } from 'react';
import { SchedulerDetails } from '..';
import GroupService from '../../../../services/group.service';
import LabelService from '../../../../services/label.service';
import UploadsService from '../../../../services/uploads.service';

const NameSection = ({
	handleChange,
	type,
	setSelectedRecipients,
	error,
}: {
	handleChange: ({
		name,
		value,
	}: {
		name: keyof SchedulerDetails;
		value: string | number | string[] | undefined;
	}) => Promise<void>;
	type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL';
	setSelectedRecipients: (ids: string[]) => void;
	error: string;
}) => {
	const [recipients, setRecipientsOptions] = useState<{ id: string; name: string }[]>([]);
	const [uiDetails, setUIDetails] = useState({
		recipientsLoading: false,
		isBusiness: true,
	});

	function fetchRecipients(type: string) {
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
	}
	return (
		<FormControl isInvalid={!!error} display={'flex'} flexDirection={'column'} gap={4}>
			<Box alignItems='flex-end' justifyContent={'space-between'}>
				<Text fontSize='xs' className='text-black dark:text-white'>
					Campaign Name
				</Text>
				<Input
					width={'full'}
					placeholder={'ex. fanfest audience'}
					border={'none'}
					className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
					_placeholder={{ opacity: 0.4, color: 'inherit' }}
					_focus={{ border: 'none', outline: 'none' }}
					onChange={(e) => handleChange({ name: 'campaign_name', value: e.target.value })}
				/>
			</Box>
			<Box alignItems='flex-end' justifyContent={'space-between'}>
				<Text fontSize='xs' className='text-black dark:text-white'>
					Recipients From
				</Text>
				<Select
					placeholder='Select one!'
					className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
					onChange={(e) => {
						handleChange({ name: 'type', value: e.target.value });
						fetchRecipients(e.target.value);
					}}
				>
					<option value='CSV'>CSV</option>
					<option value='GROUP'>Groups</option>
					{uiDetails.isBusiness ? <option value='LABEL'>Labels</option> : null}
				</Select>
			</Box>
			<Box
				alignItems='flex-end'
				justifyContent={'space-between'}
				hidden={!['CSV', 'GROUP', 'LABEL'].includes(type)}
			>
				<Text fontSize='xs' className='text-black dark:text-white'>
					Choose
				</Text>
				{type === 'CSV' ? (
					<Select
						placeholder='Select one!'
						className='  bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none w-full '
						onChange={(e) => handleChange({ name: 'csv_file', value: e.target.value })}
					>
						{recipients.map(({ id, name }) => (
							<option value={id}>{name}</option>
						))}
					</Select>
				) : (
					<Multiselect
						disable={uiDetails.recipientsLoading}
						displayValue='name'
						placeholder={
							type === 'GROUP'
								? 'Select Groups'
								: type === 'LABEL'
								? 'Select Labels'
								: 'Select One!'
						}
						onRemove={(selectedList) =>
							setSelectedRecipients(selectedList.map((label: any) => label.id))
						}
						onSelect={(selectedList) =>
							setSelectedRecipients(selectedList.map((label: any) => label.id))
						}
						showCheckbox={true}
						hideSelectedList={true}
						options={recipients}
						style={{
							searchBox: {
								border: 'none',
							},
							inputField: {
								width: '100%',
							},
						}}
						className='  bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none w-full '
					/>
				)}
			</Box>
			{error && <FormErrorMessage>{error}</FormErrorMessage>}
		</FormControl>
	);
};

export default NameSection;

import { Box, Flex, FormControl, FormErrorMessage, Input, Text } from '@chakra-ui/react';
import { SchedulerDetails } from '..';

const DelaySection = ({
	details,
	handleChange,
	error,
	isHidden,
}: {
	details: {
		min_delay: number;
		max_delay: number;
		startTime: string;
		endTime: string;
		batch_delay: number;
		batch_size: number;
	};
	handleChange: ({
		name,
		value,
	}: {
		name: keyof SchedulerDetails;
		value: string | number | string[] | undefined;
	}) => Promise<void>;
	error: string;
	isHidden: boolean;
}) => {
	return (
		<FormControl
			isInvalid={!!error}
			display={'flex'}
			flexDirection={'column'}
			gap={2}
			hidden={isHidden}
		>
			<Box justifyContent={'space-between'}>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400' fontWeight={'medium'}>
					Message Delay
				</Text>
				<Flex gap={2}>
					<Box flexGrow={1}>
						<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
							Min Delay
						</Text>
						<Input
							width={'full'}
							placeholder='5'
							size={'sm'}
							rounded={'md'}
							border={'none'}
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
							_focus={{ border: 'none', outline: 'none' }}
							type='number'
							min={1}
							value={details.min_delay.toString()}
							onChange={(e) => handleChange({ name: 'min_delay', value: Number(e.target.value) })}
						/>
					</Box>
					<Box flexGrow={1}>
						<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
							Max Delay
						</Text>
						<Input
							width={'full'}
							placeholder='55'
							size={'sm'}
							rounded={'md'}
							border={'none'}
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
							_focus={{ border: 'none', outline: 'none' }}
							type='number'
							min={1}
							value={details.max_delay.toString()}
							onChange={(e) => handleChange({ name: 'max_delay', value: Number(e.target.value) })}
						/>
					</Box>
				</Flex>
			</Box>

			<Box justifyContent={'space-between'}>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400' fontWeight={'medium'}>
					Batch Setting
				</Text>
				<Flex gap={2}>
					<Box flexGrow={1}>
						<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
							Batch Size
						</Text>
						<Input
							width={'full'}
							placeholder='5'
							size={'sm'}
							rounded={'md'}
							border={'none'}
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
							_focus={{ border: 'none', outline: 'none' }}
							type='number'
							min={1}
							value={details.batch_size.toString()}
							onChange={(e) => handleChange({ name: 'batch_size', value: Number(e.target.value) })}
						/>
					</Box>
					<Box flexGrow={1}>
						<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
							Batch Delay
						</Text>
						<Input
							width={'full'}
							placeholder='55'
							size={'sm'}
							rounded={'md'}
							border={'none'}
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
							_focus={{ border: 'none', outline: 'none' }}
							type='number'
							min={1}
							value={details.batch_delay.toString()}
							onChange={(e) => handleChange({ name: 'batch_delay', value: Number(e.target.value) })}
						/>
					</Box>
				</Flex>
			</Box>

			<Box justifyContent={'space-between'}>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400' fontWeight={'medium'}>
					Schedule Setting
				</Text>
				<Flex gap={2}>
					<Box flexGrow={1}>
						<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
							Start At
						</Text>
						<Input
							width={'full'}
							placeholder='00:00'
							size={'sm'}
							rounded={'md'}
							border={'none'}
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
							_focus={{ border: 'none', outline: 'none' }}
							value={details.startTime}
							onChange={(e) => handleChange({ name: 'batch_size', value: e.target.value })}
						/>
					</Box>
					<Box flexGrow={1}>
						<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
							End At
						</Text>
						<Input
							width={'full'}
							placeholder='23:59'
							size={'sm'}
							rounded={'md'}
							border={'none'}
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
							_focus={{ border: 'none', outline: 'none' }}
							value={details.endTime}
							onChange={(e) => handleChange({ name: 'endTime', value: e.target.value })}
						/>
					</Box>
				</Flex>
			</Box>

			{error && (
				<FormErrorMessage mt={-2} textAlign={'center'}>
					{error}
				</FormErrorMessage>
			)}
		</FormControl>
	);
};

export default DelaySection;

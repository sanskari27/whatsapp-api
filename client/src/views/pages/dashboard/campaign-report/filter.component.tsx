import { Box, CloseButton, Icon, useDisclosure } from '@chakra-ui/react';
import { DateRangePicker } from 'react-date-range';
import { BsFillCalendarDateFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../../config/const';
import { StoreNames, StoreState } from '../../../../store';
import { setFilterDateEnd, setFilterDateStart } from '../../../../store/reducers/SchedulerReducer';

export default function Filters() {
	const { isOpen, onToggle, onClose } = useDisclosure();
	const dispatch = useDispatch();

	const {
		ui: { filterDateStart, filterDateEnd },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	const selectionRange = {
		startDate: filterDateStart,
		endDate: filterDateEnd,
		key: 'selection',
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleSelect = (ranges: any) => {
		if ('selection' in ranges) {
			const selection = ranges.selection as {
				startDate: Date;
				endDate: Date;
			};
			dispatch(setFilterDateStart(selection.startDate));
			dispatch(setFilterDateEnd(selection.endDate));
		}
	};
	return (
		<Box position={'relative'}>
			{isOpen ? (
				<CloseButton onClick={onClose} color={Colors.PRIMARY_DARK} />
			) : (
				<Icon
					as={BsFillCalendarDateFill}
					width='24px'
					height='24px'
					cursor={'pointer'}
					onClick={onToggle}
					color={Colors.PRIMARY_DARK}
				/>
			)}

			<Box
				hidden={!isOpen}
				right={'130px'}
				top={'10px'}
				position={'absolute'}
				padding={'1rem'}
				bgColor={Colors.BACKGROUND_LIGHT}
				rounded={'lg'}
				shadow={'lg'}
			>
				<DateRangePicker ranges={[selectionRange]} onChange={handleSelect} color='red' />
			</Box>
		</Box>
	);
}

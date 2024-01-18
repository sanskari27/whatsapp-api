import { useEffect } from 'react';
import { BiPoll } from 'react-icons/bi';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import ReportsService from '../../../services/reports.service';

const PollReport = () => {
	useEffect(() => {
		ReportsService.listPolls().then((res) => console.log(res));
	});

	useEffect(() => {
		pushToNavbar({
			title: 'Polls Reports',
			icon: BiPoll,
		});
		return () => {
			popFromNavbar();
		};
	}, []);

	return <div>Report</div>;
};

export default PollReport;

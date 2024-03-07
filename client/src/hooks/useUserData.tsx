import { useBoolean, useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { DATA_LOADED_DELAY } from '../config/const';
import AttachmentService from '../services/attachment.service';
import BotService from '../services/bot.service';
import ContactCardService from '../services/contact-card.service';
import GroupService from '../services/group.service';
import LabelService from '../services/label.service';
import MessageService from '../services/message.service';
import ShortenerService from '../services/shortener.service';
import UploadsService from '../services/uploads.service';
import UserService from '../services/user.service';
import { store } from '../store';
import { setAttachments } from '../store/reducers/AttachmentReducers';
import { setBots } from '../store/reducers/BotReducers';
import { setCSVFileList } from '../store/reducers/CSVFileReducers';
import { setContactList } from '../store/reducers/ContactCardReducers';
import { setLinksList } from '../store/reducers/LinkShortnerReducers';
import { setMergedGroupList } from '../store/reducers/MergeGroupReducer';
import { setAllSchedulers } from '../store/reducers/SchedulerReducer';
import { setUserDetails } from '../store/reducers/UserDetailsReducers';
import { useAuth } from './useAuth';

export default function useUserData() {
	const [hasError, setError] = useState(false);
	const [dataLoaded, setDataLoaded] = useBoolean(false);
	const { isSocketInitialized } = useAuth();
	const toast = useToast();

	const fetchUserDetails = useCallback(async () => {
		try {
			// toast.promise(GroupService.listGroups(), {
			// 	success: (res) => {
			// 		store.dispatch(
			// 			setUserDetails({
			// 				groups: res,
			// 			})
			// 		);
			// 		return {
			// 			title: 'Groups loaded.',
			// 			duration: 3000,
			// 		};
			// 	},
			// 	error: {
			// 		title: 'Error loading groups.',
			// 		duration: 3000,
			// 	},
			// 	loading: {
			// 		title: 'Loading groups.',
			// 	},
			// });

			const promises = [
				UserService.getUserDetails(),
				ContactCardService.ListContactCards(),
				AttachmentService.getAttachments(),
				UploadsService.listCSV(),
				LabelService.listLabels(),
				BotService.listBots(),
				ShortenerService.listAll(),
				GroupService.mergedGroups(),
				MessageService.getScheduledMessages(),
				addDelay(DATA_LOADED_DELAY),
			];

			const results = await Promise.all(promises);

			store.dispatch(
				setUserDetails({
					...results[0],
					labels: results[4],
					contactsCount: null,
					data_loaded: true,
				})
			);
			store.dispatch(setContactList(results[1]));
			store.dispatch(setAttachments(results[2]));
			store.dispatch(setCSVFileList(results[3]));
			store.dispatch(setBots(results[5]));
			store.dispatch(setLinksList(results[6]));
			store.dispatch(setMergedGroupList(results[7]));
			store.dispatch(setAllSchedulers(results[8]));
			setDataLoaded.on();
		} catch (e) {
			setError(true);
			setDataLoaded.on();
			return;
		}
	}, [setDataLoaded, toast]);

	useEffect(() => {
		if (isSocketInitialized) {
			setDataLoaded.off();
			fetchUserDetails();
		}
	}, [fetchUserDetails, setDataLoaded, isSocketInitialized]);

	return {
		loading: !dataLoaded,
		error: hasError,
	};
}

function addDelay(delay: number) {
	return new Promise((resolve: (value?: null) => void) => {
		setTimeout(() => {
			resolve();
		}, delay);
	});
}

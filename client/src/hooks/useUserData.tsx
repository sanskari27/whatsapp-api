import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AttachmentService from '../services/attachment.service';
import AuthService from '../services/auth.service';
import BotService from '../services/bot.service';
import ContactCardService from '../services/contact-card.service';
import GroupService from '../services/group.service';
import LabelService from '../services/label.service';
import MessageService from '../services/message.service';
import ShortenerService from '../services/shortener.service';
import UploadsService from '../services/uploads.service';
import { StoreNames, StoreState, store } from '../store';
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
	const { isAuthenticated } = useAuth();

	const { current_profile } = useSelector((state: StoreState) => state[StoreNames.USER]);

	const fetchProfileData = useCallback(async () => {
		try {
			const promises = [
				addDelay(2000),
				GroupService.listGroups(),
				LabelService.listLabels(),
				GroupService.mergedGroups(),
			];

			const results = await Promise.all(promises);

			store.dispatch(
				setUserDetails({
					groups: results[1],
					labels: results[2],
					data_loaded: true,
				})
			);
			store.dispatch(setMergedGroupList(results[3]));
		} catch (e) {
			setError(true);
			return;
		}
	}, []);

	const fetchProfiles = useCallback(async () => {
		try {
			const { profiles, max_profiles, isSubscribed, username } = await AuthService.profiles();
			if (profiles.length === 0) {
				store.dispatch(
					setUserDetails({
						data_loaded: true,
						current_profile: '',
						profiles: [],
						name: '',
						phoneNumber: '',
						isSubscribed: isSubscribed,
						subscriptionExpiration: '',
						current_profile_type: 'PERSONAL',
						max_profiles: max_profiles,
						username,
					})
				);
				return;
			}
			store.dispatch(
				setUserDetails({
					...profiles[0],
					profiles,
					current_profile: profiles[0].client_id,
					max_profiles: max_profiles,
					isSubscribed: isSubscribed,
					username,
				})
			);
		} catch (e) {
			setError(true);
			return;
		}
	}, []);

	useEffect(() => {
		if (!isAuthenticated) {
			return;
		}

		ContactCardService.ListContactCards().then((res) => store.dispatch(setContactList(res)));
		ShortenerService.listAll().then((res) => store.dispatch(setLinksList(res)));
		AttachmentService.getAttachments().then((res) => store.dispatch(setAttachments(res)));
		UploadsService.listCSV().then((res) => store.dispatch(setCSVFileList(res)));
		BotService.listBots().then((res) => store.dispatch(setBots(res)));
		MessageService.getDailyMessenger().then((res) => store.dispatch(setAllSchedulers(res)));
		fetchProfiles();
	}, [fetchProfiles, isAuthenticated]);

	useEffect(() => {
		if (!current_profile) {
			return;
		}
		fetchProfileData();
	}, [current_profile, fetchProfileData]);

	return {
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

export async function fetchProfileData() {
	const promises = [
		addDelay(2000),
		BotService.listBots(),
		GroupService.listGroups(),
		LabelService.listLabels(),
		GroupService.mergedGroups(),
	];

	const results = await Promise.all(promises);

	store.dispatch(
		setUserDetails({
			groups: results[1],
			labels: results[2],
			data_loaded: true,
		})
	);
	store.dispatch(setBots(results[0]));
	store.dispatch(setMergedGroupList(results[3]));
}

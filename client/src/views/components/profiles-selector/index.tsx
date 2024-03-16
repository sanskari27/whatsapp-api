import { Box, Checkbox, HStack, Text } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { Colors } from '../../../config/const';
import { StoreNames, StoreState } from '../../../store';
import Each from '../../../utils/Each';

export default function ProfileSelector({
	selectedProfiles,
	onProfileRemoved,
	onProfileSelected,
}: {
	selectedProfiles: string[];
	onProfileSelected: (text: string) => void;
	onProfileRemoved: (text: string) => void;
}) {
	const { profiles } = useSelector((state: StoreState) => state[StoreNames.USER]);

	return (
		<HStack px={'1rem'} py={'0.5rem'} bgColor={Colors.ACCENT_LIGHT} rounded={'md'} width={'full'}>
			<Box color={Colors.ACCENT_DARK} fontWeight={'medium'} mr={'2rem'}>
				<Text>Profiles</Text>
			</Box>
			{profiles.length > 0 ? (
				<Each
					items={profiles}
					render={(profile, index) => (
						<Checkbox
							colorScheme='green'
							isChecked={selectedProfiles.includes(profile.client_id)}
							color={Colors.ACCENT_DARK}
							onChange={(e) => {
								if (e.target.checked) {
									onProfileSelected(profile.client_id);
								} else {
									onProfileRemoved(profile.client_id);
								}
							}}
						>
							Profile {index + 1}
						</Checkbox>
					)}
				/>
			) : (
				<Text color={'red'}>No Profiles Found</Text>
			)}
		</HStack>
	);
}

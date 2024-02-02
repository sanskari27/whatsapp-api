import axios from 'axios';
import { GOOGLE_API_KEY } from '../config/const';

async function listPlaces(location: string) {
	// curl -X POST -d '{
	//   "textQuery" : "Mansi Bazaar, Bihar"
	// }' \
	// -H 'Content-Type: application/json' -H 'X-Goog-Api-Key: AIzaSyBd_GoRLGz7eYxgFiVMBqHBAm-S6eyQb_c' \
	// -H 'X-Goog-FieldMask: places.id,places.displayName.text,places.formattedAddress,places.location' \
	// 'https://places.googleapis.com/v1/places:searchText'
	const FIELDS = [
		'places.id',
		'places.displayName.text',
		'places.formattedAddress',
		'places.location',
	];
	const { data } = await axios.post(
		'https://places.googleapis.com/v1/places:searchText',
		{
			textQuery: location,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-Api-Key': GOOGLE_API_KEY,
				'X-Goog-FieldMask': FIELDS.join(','),
			},
		}
	);

	const places = data.places as {
		id: string;
		formattedAddress: string;
		location: {
			latitude: number;
			longitude: number;
		};
		displayName: {
			text: string;
		};
	}[];

	return places.map((place) => ({
		id: place.id,
		address: place.formattedAddress,
		display_name: place.displayName.text,
		location: place.location,
	}));
}

const MapUtils = {
	listPlaces,
};
export default MapUtils;

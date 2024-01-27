import { useMemo } from 'react';
import { useNavbar } from './useNavbar';

export default function useFilteredList<T extends object>(
	list: T[],
	opts: { [K in keyof T]?: number }
): T[] {
	const { searchText } = useNavbar();

	const filtered = useMemo(
		() =>
			list.filter((obj) => {
				for (const key in opts) {
					if (key in obj && opts[key] === 1) {
						return (obj[key] as string).toLowerCase().startsWith(searchText.toLowerCase());
					}
				}
				return false;
			}),
		[list, searchText, opts]
	);
	return filtered;
}

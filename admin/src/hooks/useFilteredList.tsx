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
						if (typeof obj[key] === 'string') {
							if ((obj[key] as string).toLowerCase().startsWith(searchText.toLowerCase())) {
								return true;
							}
						} else if (Array.isArray(obj[key])) {
							if (
								(obj[key] as string[]).some((value) =>
									value.toLowerCase().startsWith(searchText.toLowerCase())
								)
							) {
								return true;
							}
						}
					}
				}
				return false;
			}),
		[list, searchText, opts]
	);
	return filtered;
}

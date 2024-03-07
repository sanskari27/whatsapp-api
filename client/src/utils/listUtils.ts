export function filterList<T extends object, U extends object>(
	list: T[],
	searchText: string,
	opts: {
		[K in keyof T]?: number;
	} & {
		customFilter?: (item: T, state: U) => boolean;
		customFilterDeps?: U;
	}
): T[] {
	if (opts.customFilter && !opts.customFilterDeps) {
		throw new Error('Custom filter must provide customFilterDeps for dependencies.');
	}

	return list.filter((obj) => {
		if (!searchText) {
			if (opts.customFilter && !opts.customFilter(obj, opts.customFilterDeps ?? ({} as U))) {
				return false;
			}
			return true;
		} else {
			if (opts.customFilter && !opts.customFilter(obj, opts.customFilterDeps ?? ({} as U))) {
				return false;
			}
		}

		for (const key in opts) {
			const opt = opts[key as keyof T];
			if (key in obj && typeof opt === 'number' && opt === 1) {
				return (obj[key as keyof T] as string).toLowerCase().startsWith(searchText.toLowerCase());
			}
		}

		return false;
	});
}

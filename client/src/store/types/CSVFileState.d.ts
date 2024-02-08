export type CSVFileState = {
	list: {
		id: string;
		name: string;
		headers: string[];
		_id: string;
	}[];
	selectedCSV: {
		_id: string;
		id: string;
		name: string;
		headers: string[];
	};
	uiDetails: {
		isSaving: boolean;
		isFetching: boolean;
		isDeleting: boolean;
		isCreating: boolean;
		isUpdating: boolean;
		error: string;
	};
	csvFile?: File;
};

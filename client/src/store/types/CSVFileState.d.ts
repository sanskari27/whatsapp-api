export type CSVFileState = {
	list: {
		fileName: string;
		name: string;
		headers: string[];
		id: string;
	}[];
	selectedCSV: {
		id: string;
		fileName: string;
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

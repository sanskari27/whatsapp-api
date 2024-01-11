export type CSVFileState = {
    list: {
        id: string;
        _id: string;
        name: string;
        headers: string[];
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

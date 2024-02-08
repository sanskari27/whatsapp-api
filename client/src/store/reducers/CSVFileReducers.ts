import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { CSVFileState } from '../types/CSVFileState';

const initialState: CSVFileState = {
	list: [],
	selectedCSV: {
		_id: '',
		id: '',
		name: '',
		headers: [],
	},
	uiDetails: {
		isSaving: false,
		isFetching: false,
		isDeleting: false,
		isCreating: false,
		isUpdating: false,
		error: '',
	},
	csvFile: undefined,
};

const CSVFileSlice = createSlice({
	name: StoreNames.CSV,
	initialState,
	reducers: {
		reset: (state) => {
			state.list = initialState.list;
			state.selectedCSV = initialState.selectedCSV;
			state.uiDetails = initialState.uiDetails;
		},
		setCSVFileList: (state, action: PayloadAction<typeof initialState.list>) => {
			state.list = action.payload;
		},
		addCsvFileList: (state, action: PayloadAction<(typeof initialState.list)[0]>) => {
			state.list.push(action.payload);
			state.uiDetails.isSaving = false;
		},
		deleteSelectedCSVFile: (state, action: PayloadAction<{ id: string }>) => {
			state.list = state.list.filter((csv) => csv.id !== action.payload.id);
			state.selectedCSV = initialState.selectedCSV;
			state.uiDetails.isDeleting = false;
		},
		findSelectedCSVFile: (state, action: PayloadAction<{ id: string }>) => {
			state.selectedCSV =
				state.list.find((csv) => csv.id === action.payload.id) || initialState.selectedCSV;
		},
		clearSelectedCSVFile: (state) => {
			state.selectedCSV = initialState.selectedCSV;
			state.csvFile = initialState.csvFile;
			state.csvFile = initialState.csvFile;
		},
		setName: (state, action: PayloadAction<typeof initialState.selectedCSV.name>) => {
			state.selectedCSV.name = action.payload;
		},
		setFile: (state, action: PayloadAction<typeof initialState.csvFile>) => {
			state.csvFile = action.payload;
		},
		startSaving: (state) => {
			state.uiDetails.isSaving = true;
		},
		stopSaving: (state) => {
			state.uiDetails.isSaving = false;
		},
		setIsFetching: (state, action: PayloadAction<typeof initialState.uiDetails.isFetching>) => {
			state.uiDetails.isFetching = action.payload;
		},
		setIsDeleting: (state, action: PayloadAction<typeof initialState.uiDetails.isDeleting>) => {
			state.uiDetails.isDeleting = action.payload;
		},
		setIsCreating: (state, action: PayloadAction<typeof initialState.uiDetails.isCreating>) => {
			state.uiDetails.isCreating = action.payload;
		},
		setIsUpdating: (state, action: PayloadAction<typeof initialState.uiDetails.isUpdating>) => {
			state.uiDetails.isUpdating = action.payload;
		},
		setError: (state, action: PayloadAction<typeof initialState.uiDetails.error>) => {
			state.uiDetails.error = action.payload;
		},
	},
});

export const {
	reset,
	setCSVFileList,
	addCsvFileList,
	deleteSelectedCSVFile,
	findSelectedCSVFile,
	startSaving,
	stopSaving,
	setIsFetching,
	setIsDeleting,
	setIsCreating,
	setIsUpdating,
	setError,
	clearSelectedCSVFile,
	setName,
	setFile,
} = CSVFileSlice.actions;

export default CSVFileSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** A short message at the bottom of the screen. */
export interface Toast {
    readonly id: number;
    readonly message: string;
    readonly severity?: "info" | "success" | "warning" | "error";
}

export interface UiState {
    /** The crag whose callout is open on the map. */
    selectedId: string | null;
    /** The crag list is open over the map (on a phone). */
    listOpen: boolean;
    filtersOpen: boolean;
    packsOpen: boolean;
    toasts: Toast[];
    /** Where the viewer is, when they asked for it. */
    me: { lat: number; lon: number; acc: number } | null;
    /** A newer version has been published. */
    updateReady: boolean;
}

export const initialUiState: UiState = {
    selectedId: null,
    listOpen: false,
    filtersOpen: false,
    packsOpen: false,
    toasts: [],
    me: null,
    updateReady: false,
};

let nextToastId = 1;

const uiSlice = createSlice({
    name: "ui",
    initialState: initialUiState,
    reducers: {
        select: (state, action: PayloadAction<string | null>) => {
            state.selectedId = action.payload;
        },
        setListOpen: (state, action: PayloadAction<boolean>) => {
            state.listOpen = action.payload;
        },
        setFiltersOpen: (state, action: PayloadAction<boolean>) => {
            state.filtersOpen = action.payload;
        },
        setPacksOpen: (state, action: PayloadAction<boolean>) => {
            state.packsOpen = action.payload;
        },
        toast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
            state.toasts.push({ id: nextToastId++, ...action.payload });
        },
        dismissToast: (state, action: PayloadAction<number>) => {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },
        setMe: (state, action: PayloadAction<UiState["me"]>) => {
            state.me = action.payload;
        },
        setUpdateReady: (state, action: PayloadAction<boolean>) => {
            state.updateReady = action.payload;
        },
    },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;

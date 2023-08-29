import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchAttributes {
    questionId: string|null;

}

const initialState: SearchAttributes = {
    questionId: null,
};

const attributesSlice = createSlice({
    name: "attributes",
    initialState,
    reducers: {
        setField: (state: any, action: PayloadAction<Partial<SearchAttributes>>) => {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
});

export const { setField } = attributesSlice.actions;

export default attributesSlice.reducer;

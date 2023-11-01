import { createSlice } from '@reduxjs/toolkit'

const INITIAL_STATE = {
    open: false,
    message: '',
    severity: 'info'
};

export const alertSlice = createSlice({
    name: 'alert',
    initialState: INITIAL_STATE,
    reducers: {
        toggle: (state, action) => {
            const {open, message, severity} = action.payload
            state.open = open
            state.message = message
            state.severity = severity
        }
    },
})

export const alertReducer = alertSlice.reducer

export const {toggle} = alertSlice.actions

export const alertSelector = state => state.alertReducer

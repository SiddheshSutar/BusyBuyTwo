import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../fireStore';
import { USER_DB_NAME } from '../../../constants';
import { setLogInInLocal } from '../../../helpers';
import { toggle } from './alertSlice';

const initialState = {
    users: [],
    signedInUser: {

    }
}

export const signUpAsync = createAsyncThunk(
    'auth/signUp',
    async (params, {dispatch}) => {
        const {name, email, password, router} = params
        const userRef = collection(db, USER_DB_NAME);
        const docRef = await addDoc(userRef, {
            name, email, password
        });

        dispatch(toggle({
            open: true,
            message: 'Created',
            severity: 'success'
        }))
        router.push('/log-in')
    })

export const loginAsync = createAsyncThunk(
    'auth/login',
    async (params, {dispatch}) => {
        const {name, password, router} = params
        
        const docRef = query(collection(db, USER_DB_NAME), where('name', '==', name), where('password', '==', password));
        const querySnapshot = await getDocs(docRef);
        let accounts = []
        querySnapshot.forEach((doc) => {
            accounts.push({
                [doc.id]: doc.data()
            })
            
        });

        if(accounts.length !== 1) {
            dispatch(toggle({
                open: true,
                message: 'Account search error',
                severity: 'error'
            }))
            return 
        }

        dispatch(toggle({
            open: true,
            message: 'Logged In',
            severity: 'success'
        }))
        if(Object.keys(accounts[0])[0] && Object.values(accounts[0])[0]?.name) {
            setLogInInLocal(JSON.stringify({
                id: Object.keys(accounts[0])[0],
                ...Object.values(accounts[0])[0]
            }))
            dispatch(setUser(Object.values(accounts[0])[0]))
        }
        router.push('/');
    }
)

export const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setUser: (state, action) => {
            state.signedInUser = action.payload
        }
    },
})

export const authReducer = authSlice.reducer

export const {setUser} = authSlice.actions

export const authSelector = state => state.authReducer

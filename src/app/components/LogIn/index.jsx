'use client'
import { Button, Grid, TextField } from '@mui/material';
import styles from './index.module.scss'
import { useState } from 'react';
import { addDoc, collection, getDocs, doc, query, where } from '@firebase/firestore';
import { USER_DB_NAME } from '../../../../constants';
import { db } from '../../../../fireStore';
import { useRouter } from 'next/navigation'
import { setLogInInLocal } from '../../../../helpers';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector, setUser } from '../../redux/authSlice';
import { toggle } from '../../redux/alertSlice';
import { loginAsync } from '../../redux/authSlice';

const LogIn = () => {

    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

    const dispatch = useDispatch()

    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        

        if (!name || !password) {
            dispatch(toggle({
                open: true,
                message: `Please enter ${
                    !name ? 'name' : 'password'
                }`,
                severity: 'error'
            }))
            return
        }
        dispatch(loginAsync({name, password, router}))
        

    }

    return (
        <>
            <div className={styles['container']}>
                <h3>Log In</h3>
                <Grid container className={styles['form-container']} justifyContent={'center'}>
                    <Grid item lg={12}>
                        <TextField
                            placeholder='Name'
                            value={name}
                            name={"name"}
                            type='text'
                            onChange={e => setName(e.target.value)}
                        />
                    </Grid>
                    <Grid item lg={12}>
                        <TextField
                            placeholder='Password'
                            value={password}
                            name='password'
                            type='password'
                            onChange={e => setPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid item lg={12}>

                        <Button variant="contained" type='button' color='primary' onClick={e => handleSubmit(e)}>
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </>
    );
}

export default LogIn;
'use client'
import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../../../../services';
import styles from './index.module.scss'
import { Checkbox, FormControlLabel, FormGroup, Input, Slider, Tooltip } from '@mui/material';
import { getLoggedInUserInLocal, isLoggedInViaCheckingLocal } from '../../../../helpers';
import { useRouter } from 'next/navigation';
import { db } from '../../../../fireStore';
import { CART_DB_NAME, ORDER_DB_NAME, USER_DB_NAME } from '../../../../constants';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, fetchFromApiAsync, loadQuantityFromCartAsync, productsSelector, setAll, setProductsState } from '../../redux/productsSlice';
import CustomSnackbar from '../Snackbar';
import { alertSelector, toggle } from '../../redux/alertSlice';
import { authSelector, setUser } from '../../redux/authSlice';

const HomePage = () => {

    const { products, loading, maxCartValue, cart } = useSelector(productsSelector)
    const { signedInUser } = useSelector(authSelector)
    const {open, message, severity} = useSelector(alertSelector)
    
    const [searchText, setSearchText] = useState('')
    const [visibleProducts, setVisibleProducts] = useState(products)
    const [disabled, setDisabled] = useState(null)
    const [categories, setCategories] = useState([])
    const dispatch = useDispatch()

    const router = useRouter()

    useEffect(() => {

        /** Set user from localstorage */
        if (isLoggedInViaCheckingLocal()) {
            dispatch(setUser(getLoggedInUserInLocal()))
        }

    }, [])
    useEffect(() => {

        (
            async () => {
                if (signedInUser) {

                    /** Load products from API */
                    dispatch(setProductsState({
                        loading: true
                    }))

                    const res = await dispatch(fetchFromApiAsync())
                    let productsArrRes = []
                    
                    if(res.type.includes('fulfilled')) {
                        productsArrRes = res.payload
                    }
                    setVisibleProducts(productsArrRes)

                    /** Compute categories of filters */
                    if (productsArrRes.length > 0) {
                        const categs = [...new Set(productsArrRes.map(item => item.category))]

                        if (categs && categs.length > 0) {

                            setCategories(categs.map(item => (
                                {
                                    label: item,
                                    selected: false
                                }
                            )))

                        }
                    }

                    /** Load cart from DB */
                    if (cart.length === 0) {
                        const x = await dispatch(loadQuantityFromCartAsync({signedInUser}))
                    }
                }
            }
        )()

    }, [signedInUser])

    /** REFERENCE FOR DELET DOC  */
    useEffect(() => {

        // deleteDoc(doc(db, CART_DB_NAME,"cMihLUzGQlh7VqP4oafF"))

        // deleteDoc(doc(db, ORDER_DB_NAME,"12mYwq9PLGPrabYudcZc"))

        // (
        //     async () => {
        //         const updateProductRef = doc(db, CART_DB_NAME, 7);
        //         const editres = await updateDoc(updateProductRef, {
        //             id: 'eEY0tlFzIS35XsiiGKDv'
        //         });
        //     }
        // )()

    }, [])

    /** FIlter products via  */
    const handleSearchChange = e => {
        const newValue = e.target.value
        setSearchText(newValue)

        if (!newValue) {
            setVisibleProducts(products)
        } else {
            setVisibleProducts(visibleProducts.filter(prodc => {
                return prodc.title.toLowerCase().includes(newValue.toLowerCase()) || prodc.description.toLowerCase().includes(newValue.toLowerCase())
            }))

        }
    }

    function ValueLabelComponent(props) {
        const { children, value } = props;
        const val = (parseFloat(value) * maxCartValue) / 100

        return (
            <Tooltip enterTouchDelay={0} placement="top" title={val}>
                {children}
            </Tooltip>
        );
    }

    const handleAddToCart = async (productPassed, index) => {

        dispatch(addToCartAsync({
            signedInUser, router, setDisabled, index, cart, productPassed
        }))

    }

    /** Filter records based on user input keywords */
    const handleCheckBox = (e, categorySelected, checkBoxIndex) => {

        const newCategs = categories.map((categoryItem, index) => {
            if (index === checkBoxIndex) return {
                ...categoryItem,
                selected: !categoryItem.selected
            }
            return categoryItem
        })

        setCategories(newCategs)


        let selectedCategs = newCategs.filter(itemP => itemP.selected).map(item => item.label)

        if (selectedCategs.length === 0) {
            setVisibleProducts(products)
        } else {
            const filteredProducts = products.filter(item => selectedCategs.includes(item.category))
            setVisibleProducts(filteredProducts)
        }

    }


    return (
        <>
            <div className={styles['container']}>
                <div className={styles['filters']}>
                    <h4>Search by text</h4>
                    <div className={styles['search-container']}>
                        <Input
                            className={styles['search']}
                            placeholder='Search'
                            value={searchText}
                            name='search'
                            type='search'
                            sx={{
                                '.MuiInputBase-input.MuiOutlinedInput-input': {
                                    padding: '10px'
                                }
                            }}
                            onChange={e => handleSearchChange(e)}
                        />
                    </div>
                    <div className={styles['filters-container']}>
                        <h4>Price Range</h4>
                        <div className={styles['slider']}>
                            <Slider
                                size="small"
                                min={0}
                                max={maxCartValue}
                                defaultValue={100}
                                aria-label="Small"
                                valueLabelDisplay="on"
                                slots={{
                                    valueLabel: ValueLabelComponent,
                                }}
                                onChange={e => {
                                    setVisibleProducts(products.filter(item => {
                                        return item.price <= ((e.target.value * maxCartValue) / 100)
                                    }))
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <h4>Search by category</h4>
                        {
                            categories.length > 0 &&
                            categories.map((categoryItem, indexC) => (
                                <div key={indexC}>
                                    <FormGroup>
                                        <FormControlLabel control={<Checkbox
                                            checked={categoryItem.selected}
                                            onChange={e => handleCheckBox(e, categoryItem, indexC)}
                                            inputProps={{ 'aria-label': 'controlled' }}
                                        />} label={categoryItem.label} />
                                    </FormGroup>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className={styles['products']}>
                    {
                        loading ?
                            <>
                                <h2>Loading...</h2>
                            </> :
                            <>
                                {
                                    visibleProducts.map((item, index) => (
                                        <div key={index} className={styles['product']}>
                                            <img
                                                src={item.image}
                                                alt={'product-image'}
                                                className={styles['image']}
                                            />
                                            <div className={styles['title']} title={item.title}>
                                                {
                                                    item.title.length > 36 ?
                                                        item.title.substring(0, 36) + '...' :
                                                        item.title
                                                }
                                            </div>
                                            <div className={styles['btn-row']}>
                                                <div className={styles['price']}>{`₹ ${item.price}`}</div>
                                                <button className={styles['button']} type='button'
                                                    onClick={() => handleAddToCart(item, index)}
                                                    disabled={index === disabled}
                                                >
                                                    {
                                                        index === disabled ?
                                                            'Adding...' :
                                                            item.quantity ? `+1` :
                                                                'Add to Cart'
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </>
                    }
                </div>
            </div>
        </>
    )
}

export default HomePage;
'use client';
import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import styles from './index.module.scss'
import { CART_DB_NAME, ORDER_DB_NAME } from '../../../../constants';
import { db } from '../../../../fireStore';
import { useEffect } from 'react';
import { getLoggedInUserInLocal, isLoggedInViaCheckingLocal } from '../../../../helpers';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector, setUser } from '../../redux/authSlice';
import { changeProductQuantityAsync, loadQuantityFromCartAsync, loadQuantityFromOrdersAsync, orderNowAsync, productsSelector, removeProductFromCartAsync, setProductsState } from '../../redux/productsSlice';
import { toggle } from '../../redux/alertSlice';
import { useRouter } from 'next/navigation';

const Cart = () => {

    const { signedInUser } = useSelector(authSelector)
    const { products, loading, maxCartValue, cart: cartObjArray, cartId, orders } = useSelector(productsSelector)
    const [disabled, setDisabled] = useState(null)
    const dispatch = useDispatch()
    const router = useRouter()
    
    const cart = cartObjArray?.[0]?.items ? cartObjArray?.[0]?.items : cartObjArray?.[0]?.title ? cartObjArray : []

    useEffect(() => {

        if (isLoggedInViaCheckingLocal()) {
            dispatch(setUser(getLoggedInUserInLocal()))
        }

    }, [])

    useEffect(() => {
        (
            async () => {

                if (cart.length === 0 || (cart.length > 0 && cart.some(item => item.forUser))) {
                    const x = await dispatch(loadQuantityFromCartAsync({signedInUser}))
                }
                if (orders.length === 0) {
                    const x = await dispatch(loadQuantityFromOrdersAsync({ signedInUser }))
                }

            }

        )()
    }, [signedInUser])

    useEffect(() => {
    }, [cart])

    /** handle increment-decerement of products count and immediately set that in API cart */
    const handleAction = async (productPassed, index, actionSign) => {

        dispatch(changeProductQuantityAsync({
            productPassed, index, actionSign, cartId, cart
        }))
    }

    /** HELPER function to directly remove particular product */
    const removeProductFromCart = async (productPassed, removeAll) => {

        if (!cart || cart.length === 0) {
            dispatch(toggle({
                open: true,
                message: 'removeProductFromCart: Empty cart',
                severity: 'error'
            }))
            return
        }
        if (!signedInUser) {
            dispatch(toggle({
                open: true,
                message: 'removeProductFromCart: User not found',
                severity: 'error'
            }))
            return
        }

        if (
            !cartId
        ) {
            dispatch(toggle({
                open: true,
                message: 'removeProductFromCart: Cart record to be deleted not found',
                severity: 'error'
            }))
            return
        }

        const updateProductRef = doc(db, CART_DB_NAME, cartId);

        if (
            removeAll && !productPassed
        ) {
            //  deleteDoc(doc(db, CART_DB_NAME,cartId))
            let newObj = {
                forUser: signedInUser.id,
                items: []
            }
    
            const editres = await updateDoc(updateProductRef, newObj);
            const x = await dispatch(loadQuantityFromCartAsync({signedInUser}))
            const y = await dispatch(loadQuantityFromOrdersAsync({ signedInUser }))

            return
        }


        /**check Product ka entry hai kya */
        let updatedItems = [...cart]

        /** remove deleted item from cart items array */
        updatedItems = updatedItems.filter(itemObj => itemObj.id !== productPassed.id)

        let newObj = {
            forUser: signedInUser.id,
            items: [...updatedItems]
        }


        const editres = await updateDoc(updateProductRef, newObj);
        const x = await dispatch(loadQuantityFromCartAsync({signedInUser}))
        const y = await dispatch(loadQuantityFromOrdersAsync({ signedInUser }))


    }

    /** Create order for all items in cart */
    const handleOrderNow = async () => {

        await dispatch(orderNowAsync({
            signedInUser, cart, router, setDisabled
        }))
        // if (!isLoggedInViaCheckingLocal() || !signedInUser || !signedInUser.name) {
        //     dispatch(toggle({
        //         open: true,
        //         message: 'No cart ID found to map',
        //         severity: 'error'
        //     }))
        //     return
        // }
        // if (!cart || cart.length=== 0) {
        //     dispatch(toggle({
        //         open: true,
        //         message: 'Cart is empty',
        //         severity: 'error'
        //     }))
        //     return
        // }

        // dispatch(toggle({
        //     open: true,
        //     message: 'Loading',
        //     severity: 'info'
        // }))
        // setDisabled(true)

        // const orderRef = collection(db, ORDER_DB_NAME);


        // const docRef = await addDoc(orderRef, {
        //     createdAt: (new Date()).toISOString(),
        //     forUser: signedInUser.id,
        //     items: [...cart]
        // });


        await dispatch(removeProductFromCartAsync({
            cartId, signedInUser, productPassed: null, removeAll: true, cart
        }))


    }

    /** direct remove particular product */
    const handleRemove = async (cartItemToBeRemoved, index) => {

        setDisabled(true)

        await dispatch(removeProductFromCartAsync({
            cartId, signedInUser, productPassed: cartItemToBeRemoved, removeAll: false, cart
        }))
        dispatch( toggle({
            open: true,
            message: 'Item removed',
            severity: 'success'
        }))
        setDisabled(null)

    }

    return (
        <>
            <div >
                <div className={styles['title-row']}>
                    <div className={styles['title-col']}>
                        <h2>My Cart</h2>
                    </div>
                    {
                        (cart && cart.length !== 0) &&
                        <div className={styles['title-col']}>
                            <button className={styles['action-button']} type='button'
                                onClick={() => handleOrderNow()}
                            >
                                {
                                    // index === disabled ?
                                    false ?
                                        'Processing...' :
                                        'Order now'
                                }
                            </button>
                        </div>
                    }
                </div>
                <div className={styles['products']}>
                    {
                        !cart || cart.length === 0 &&
                        <p>Cart is empty..</p>
                    }
                    {
                        cart && cart.length !== 0 && cart.map((item, index) => (
                            <div key={index} className={styles['product']}>
                                <img
                                    src={item.image}
                                    alt={'product-image'}
                                    className={styles['image']}
                                />
                                <div className={styles['title']} title={item.title}>
                                    {
                                        item?.title?.length > 36 ?
                                            item.title.substring(0, 36) + '...' :
                                            item.title
                                    }
                                </div>
                                <div className={styles['cost-row']}>
                                    <div className={styles['quantity-row']}>
                                        <button className={styles['action-button']} type='button'
                                            onClick={() => handleAction(item, index, '+')}
                                        >
                                            +
                                        </button>
                                        <div className={styles['quantity']}>{item.quantity}</div>
                                        <button className={styles['action-button']} type='button'
                                            onClick={() => handleAction(item, index, '-')}
                                        >
                                            -
                                        </button>
                                    </div>
                                    <div className={styles['price']}>{`₹ ${item.price * item.quantity}`}</div>
                                </div>
                                <button className={styles['action-button']} type='button'
                                    onClick={() => handleRemove(item, index)}
                                >
                                    Remove From Cart
                                </button>
                            </div>
                        ))

                    }
                </div>
            </div>
        </>
    );
}

export default Cart;
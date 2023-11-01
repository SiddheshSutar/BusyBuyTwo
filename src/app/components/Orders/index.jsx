'use client'
import { useEffect } from 'react';
import styles from './index.module.scss'
import { getLoggedInUserInLocal, isLoggedInViaCheckingLocal } from '../../../../helpers';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../fireStore';
import { ORDER_DB_NAME } from '../../../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector, setUser } from '../../redux/authSlice';
import { loadQuantityFromOrdersAsync, productsSelector, setProductsState } from '../../redux/productsSlice';

const Orders = () => {

    const { signedInUser } = useSelector(authSelector)
    const { products, loading, maxCartValue, cart, cartId, orders } = useSelector(productsSelector)
    const dispatch = useDispatch()

    useEffect(() => {
        /** needed to set context state to avoid null values when switch pages */
        if (isLoggedInViaCheckingLocal()) {
            dispatch(setUser(getLoggedInUserInLocal()))
            
        }

    }, [])

    useEffect(() => {
        (
            async () => {

                if (orders.length === 0) {
                    const x = await dispatch(loadQuantityFromOrdersAsync({ signedInUser }))
                }

            }

        )()
    }, [signedInUser])

    /** Fetch Order list */
    const loadQuantityFromOrders = async () => {

        if (!signedInUser?.id) return

        /** fetch cart */
        const exisOrderRef = query(
            collection(db, ORDER_DB_NAME),
            where('forUser', '==', signedInUser.id),
        );
        const querySnapshot = await getDocs(exisOrderRef);
        let orderDocs = []
        querySnapshot.forEach((doc) => {
            orderDocs.push({
                [doc.id]: doc.data()
            })

        });
        const mappedList = orderDocs.map(item => ({
            id: Object.keys(item)[0],
            ...Object.values(item)[0]
        }))

        if (mappedList?.[0]?.items) {
            dispatch(setProductsState({
                order: mappedList
            }))
        }
    }

    const getDateStamp = dateStr => {
        let strFormat = ''

        const dateref = (new Date(dateStr))

        if ((dateref).getDate()) {
            strFormat = `Ordered on ${(dateref).getDate()}-${(dateref).getMonth()}-${(dateref).getFullYear()}, at ${
                (dateref).getHours()}: ${(dateref).getUTCMinutes()}`
        }
        return strFormat
    }

    return (
        <div className={styles['orders-container']}>
            <h3>My orders</h3>
            <div>
                {
                    !orders || orders.length === 0 &&
                    <p>No orders found yet..</p>
                }
                {
                    orders?.length > 0 &&
                    orders.map((orderItem, orderItemIndex) => (
                        <div key={orderItemIndex} className={styles['order-obj-wrapper']}>
                            <table cellspacing="0" cellpadding="0" className={styles['order-table']} border={0}>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Image</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        (
                                            Array.isArray(orderItem.items) ? orderItem.items : orders
                                        ).map((orderObj, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <img
                                                        src={orderObj.image}
                                                        alt={orderObj.title}
                                                    />
                                                </td>
                                                <td>
                                                    {orderObj.title}
                                                </td>
                                                <td>
                                                    {orderObj.quantity}
                                                </td>
                                                <td>
                                                    {orderObj.price}
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <div className={styles['timestamp-row']}>
                                {
                                    orderItem.createdAt && getDateStamp(orderItem.createdAt) &&
                                    <div>
                                        {getDateStamp(orderItem.createdAt)}
                                    </div>
                                }
                            </div>
                        </div>
                    ))

                }
            </div>
        </div>
    );
}

export default Orders;

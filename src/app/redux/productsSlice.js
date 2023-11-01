import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchProducts } from '../../../services'
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { isLoggedInViaCheckingLocal } from '../../../helpers'
import { CART_DB_NAME, ORDER_DB_NAME } from '../../../constants'
import { toggle } from './alertSlice'
import { db } from '../../../fireStore'

const initialState = {
  loading: false,
  products: [],
  cart: [],
  orders: [],
  maxCartValue: 0,
  cartId: null,
  orderId: null
}

/** Function to fetch products from fake API and use it in out app */
export const fetchFromApiAsync = createAsyncThunk(
  'auth/fetchFromApi',
  async (params, { dispatch }) => {
    const productsArrRes = await fetchProducts()

    dispatch(setProductsState({
      loading: false
    }))
    dispatch(setAll(productsArrRes))
    return productsArrRes
  })

/** Function to fetch products added to cart.
 * Checks for corresponding cart object as per userId
 */
export const loadQuantityFromCartAsync = createAsyncThunk(
  'auth/loadQuantityFromCartAsync',
  async (params, { dispatch }) => {
    const { signedInUser } = params

    if (!signedInUser.id) return

    const exisCartref = query(
      collection(db, CART_DB_NAME),
      where('forUser', '==', signedInUser.id),
    );
    const querySnapshot = await getDocs(exisCartref);

    let cartDocs = []
    querySnapshot.forEach((doc) => {
      cartDocs.push({
        [doc.id]: doc.data()
      })

    });

    const mappedList = cartDocs.map(item => ({
      id: Object.keys(item)[0],
      ...Object.values(item)[0]
    }))
    dispatch(setProductsState({
      cart: mappedList
    }))
    dispatch(setProductsState({
      cartId: mappedList[0]?.id
    }))
  })

/** Function to fetch products ordered.
 * Checks for corresponding cart object as per userId
 */
export const loadQuantityFromOrdersAsync = createAsyncThunk(
  'auth/loadQuantityFromOrdersAsync',
  async (params, { dispatch }) => {
    const { signedInUser } = params

    if (!signedInUser.id) return

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
        // orders: mappedList[0].items.map(item => ({
        //   ...item
        // }))
        orders: mappedList
      }))
      dispatch(setProductsState({
        orderId: mappedList[0].id
      }))
    }
  })

/** Function to handle add to cart functionality.
 */
export const addToCartAsync = createAsyncThunk(
  'auth/addToCartAsync',
  async (params, { dispatch, ...rest }) => {
    const { signedInUser, router, setDisabled, index, cart, productPassed } = params

    /** Check whether the variables needed to execute add to cart API call are there opr not;
         * then only make the request
         */
    if (!isLoggedInViaCheckingLocal() || !signedInUser || !signedInUser.name) {
      router.push('/log-in')
      return
    }

    dispatch(toggle({
      open: true,
      message: 'Loading',
      severity: 'info'
    }))


    setDisabled(index)

    const cartRef = collection(db, CART_DB_NAME);

    /**check User ka entry hai kya */
    let docKey = null
    const foundRecord = cart.find(item => signedInUser.id === item.forUser)

    /**
      * Handles if item is already present in card, then increase quantity; else create new object
     */
    if (
      foundRecord
    ) {

      docKey = foundRecord.id
      const updateProductRef = doc(db, CART_DB_NAME, docKey);

      /**check Product ka entry hai kya */
      let isUpdated = false
      let updatedItems = [...foundRecord.items]

      updatedItems = updatedItems.map(itemObj => {
        if (itemObj.id === productPassed.id) {
          isUpdated = true
          return {
            ...itemObj,
            quantity: itemObj.quantity + 1
          }
        } else return itemObj
      })

      if (!isUpdated) updatedItems = [{
        ...productPassed,
        quantity: 1
      }, ...updatedItems]

      let newObj = {
        ...foundRecord,
        items: [...updatedItems]
      }

      
      const editres = await updateDoc(updateProductRef, newObj);
      const x = await dispatch(loadQuantityFromCartAsync({ signedInUser }))

    } else {
      const docRef = await addDoc(cartRef, {
        forUser: signedInUser.id,
        items: [
          {
            ...productPassed,
            quantity: 1
          }
        ]
      });
      const x = await dispatch(loadQuantityFromCartAsync({ signedInUser }))

    }

    dispatch(toggle({
      open: true,
      message: 'Updated the cart',
      severity: 'success'
    }))
    setDisabled(null)

  })

/**
 * Function to handle change in qunatity from cart
 */
export const changeProductQuantityAsync = createAsyncThunk(
  'auth/changeProductQuantityAsync',
  async (params, { dispatch, ...rest }) => {

    const { productPassed, index, actionSign, cartId, cart } = params

    if (!cartId) {
      dispatch(toggle({
        open: true,
        message: 'No cart ID found to map',
        severity: 'error'
      }))
      return
    }

    if (actionSign === '-' && productPassed.quantity === 0) {
      return
    }

    if (actionSign === '+' && productPassed.quantity + 1 > 4) {
      dispatch(toggle({
        open: true,
        message: 'Max order limit reached : 4',
        severity: 'error'
      }))
      return
    }

    let newCart = [...cart]

    if (actionSign === '-' && productPassed.quantity === 1) {
      newCart = cart.filter(item => item.id !== productPassed.id)
    } else {
      newCart = cart.map(item => {
        if (item.id === productPassed.id) {
          return {
            ...item,
            quantity: actionSign === '+' ? item.quantity + 1 : item.quantity - 1
          }
        } else return item
      })
    }


    dispatch(setProductsState({
      cart: newCart
    }))

    const updateProductRef = doc(db, CART_DB_NAME, cartId);
    const editres = await updateDoc(updateProductRef, {
      items: newCart
    });
    const x = await dispatch(loadQuantityFromCartAsync({ signedInUser }))

    dispatch(toggle({
      open: true,
      message: 'Cart Updated',
      severity: 'success'
    }))

  })

  /**
 * Function to handle order button click
 */
export const orderNowAsync = createAsyncThunk(
  'auth/orderNowAsync',
  async (params, { dispatch, ...rest }) => {

    const { signedInUser, cart, router, setDisabled } = params

    if (!isLoggedInViaCheckingLocal() || !signedInUser || !signedInUser.name) {
      dispatch(toggle({
        open: true,
        message: 'No cart ID found to map',
        severity: 'error'
      }))
      return
    }
    if (!cart || cart.length === 0) {
      dispatch(toggle({
        open: true,
        message: 'Cart is empty',
        severity: 'error'
      }))
      return
    }

    dispatch(toggle({
      open: true,
      message: 'Loading',
      severity: 'info'
    }))
    setDisabled(true)

    const orderRef = collection(db, ORDER_DB_NAME);


    const docRef = await addDoc(orderRef, {
      createdAt: (new Date()).toISOString(),
      forUser: signedInUser.id,
      items: [...cart]
    });

    dispatch(toggle({
      open: true,
      message: 'Order successful!',
      severity: 'success'
    }))
    setDisabled(false)
    router.push('/orders')


  })
  
/** Handle remove from cart */
export const removeProductFromCartAsync = createAsyncThunk(
  'auth/removeProductFromCartAsync',
  async (params, { dispatch, ...rest }) => {

    const { cartId, signedInUser, productPassed, removeAll, cart } = params

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
      const x = await dispatch(loadQuantityFromCartAsync({ signedInUser }))
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
    const x = await dispatch(loadQuantityFromCartAsync({ signedInUser }))
    const y = await dispatch(loadQuantityFromOrdersAsync({ signedInUser }))

  })

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductsState: (state, action) => {
      state[Object.keys(action.payload)[0]] = Object.values(action.payload)[0]
    },
    setAll: (state, action) => {
      let max = 0
      for (const item of action.payload) {
        if (item.price > max) max = item.price
      }

      state.products = action.payload
      state.maxCartValue = max
    },
  }
})

export const productsReducer = productsSlice.reducer

export const { setProductsState, setAll } = productsSlice.actions

export const productsSelector = state => state.productsReducer

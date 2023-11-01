'use client';
import { useParams } from "next/navigation";
import Cart from "../components/Cart";
import { Provider } from "react-redux";
import { store } from "../../../store";
import SnackbarWrapper from "../components/SnackbarWrapper";

const CartPage = () => {
    return <>
        <Provider store={store}>
            <Cart />
            <SnackbarWrapper />
        </Provider>
    </>
}

export default CartPage;
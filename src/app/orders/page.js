'use client';
import { useParams } from "next/navigation";
import Orders from "../components/Orders";
import { Provider } from "react-redux";
import { store } from "../../../store";
import SnackbarWrapper from "../components/SnackbarWrapper";

const OrdersPage = () => {
    return <>
        <Provider store={store}>
            <Orders />
            <SnackbarWrapper />
        </Provider>
    </>
}

export default OrdersPage;
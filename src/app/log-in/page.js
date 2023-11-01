'use client';
import { useParams } from "next/navigation";
import LogIn from "../components/LogIn";
import { Provider } from "react-redux";
import { store } from "../../../store";
import SnackbarWrapper from "../components/SnackbarWrapper";

const LogInPage = () => {
    return <>
        <Provider store={store}>
            <LogIn />
            <SnackbarWrapper />
        </Provider>
    </>
}

export default LogInPage;
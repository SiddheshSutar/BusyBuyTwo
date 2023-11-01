'use client';
import { useParams } from "next/navigation";
import SignUp from "../components/SignUp";
import SnackbarWrapper from "../components/SnackbarWrapper";
import { Provider } from "react-redux";
import { store } from "../../../store";

const SignUpPage = () => {
    const params = useParams()
    return <>
        <Provider store={store}>
            <SignUp />
            <SnackbarWrapper />
        </Provider>
    </>
}

export default SignUpPage;
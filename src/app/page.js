"use client"
import { Provider } from "react-redux";
import HomePage from "./components/HomePage/HomePage";
import SignUp from "./components/SignUp";
import CustomSnackbar from "./components/Snackbar";
import { store } from "../../store";
import SnackbarWrapper from "./components/SnackbarWrapper";

export default function Home() {
  return <>
    <Provider store={store}>
        <HomePage />
        <SnackbarWrapper />
    </Provider>
  </>
}

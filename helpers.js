import { LS_TOKEN_NAME } from "./constants";

export const isLoggedInViaCheckingLocal = () => {
    if (typeof window !== 'undefined') {
        return Boolean(localStorage.getItem(LS_TOKEN_NAME))
    } else {
        return false
    }
}

export const setLogInInLocal = (name) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(LS_TOKEN_NAME, name)
    }
}
export const removeLogInFromLocal = (name) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(LS_TOKEN_NAME)
    }
}

export const getLoggedInUserInLocal = (name) => {
    if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem(LS_TOKEN_NAME))
    } else {
        return {}
    }
}
 
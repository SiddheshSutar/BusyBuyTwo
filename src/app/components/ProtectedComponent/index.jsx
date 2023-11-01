import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getTokenFromLocal } from "../../../../helpers";

const Protected = ({ children }) => {

    const [isLoggedIn, setIsLoggedIn] = useState() 
    const router = useRouter()

    useEffect(() => {
        if (getTokenFromLocal()) {
            setIsLoggedIn(true)
        }
    }, [])

    if (!isLoggedIn) {
        router.push('/log-in')
        return <></>;
    }
    return children;
};

export default Protected
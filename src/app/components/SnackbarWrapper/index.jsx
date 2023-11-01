'use client'
import { useDispatch, useSelector } from "react-redux";
import CustomSnackbar from "../Snackbar";
import { alertSelector, toggle } from "../../redux/alertSlice";

const SnackbarWrapper = () => {
    const {open, message, severity} = useSelector(alertSelector)
    const dispatch = useDispatch()
    return (
        <div>
            <CustomSnackbar
                open={open}
                onClose={() => dispatch(toggle({
                    open: false,
                    message: '',
                    severity: 'info'
                }))}
                message={message}
                severity={severity}
            />
        </div>
    );
}
 
export default SnackbarWrapper;
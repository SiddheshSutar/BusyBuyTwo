import { Alert, Snackbar } from "@mui/material";

const CustomSnackbar = ({
    open,
    onClose,
    severity,
    message
}) => {
    return (
            <Snackbar
                open={open}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                onClose={onClose}
            >
                <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
    );
}
 
export default CustomSnackbar;
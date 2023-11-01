'use client';

import CustomSnackbar from "../Snackbar";

const Loader = () => {
    return (
        <>
            <CustomSnackbar
                message={'Loading'}
                open={true}
                onClose={() => { }}
                severity={'info'}
            />
        </>
    );
}
 
export default Loader;
const asyncHandler = (fnToExecute) => {
    return async (req, res, next) => {
        try {
            await fnToExecute(req, res, next)
        } catch (error) {
            console.error(new Date().toLocaleString(), error.stack || error.message || error)
            
            let statusCode = 500;
            if (typeof error.code === 'number' && error.code >= 100 && error.code < 600) {
                statusCode = error.code;
            } else if (typeof error.status === 'number' && error.status >= 100 && error.status < 600) {
                statusCode = error.status;
            } else if (typeof error.statusCode === 'number' && error.statusCode >= 100 && error.statusCode < 600) {
                statusCode = error.statusCode;
            }

            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error"
            })
        }
    }
}


export { asyncHandler }


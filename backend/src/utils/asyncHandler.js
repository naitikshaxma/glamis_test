const asyncHandler = (fnToExecute) => {
    return async (req, res, next) => {
        try {
            await fnToExecute(req, res, next)
        } catch (error) {
            console.error(new Date().toLocaleString(), error.message)
            const statusCode = typeof error.code === 'number' && error.code >= 100 && error.code <= 599 ? error.code : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message
            })
        }
    }
}


export { asyncHandler }

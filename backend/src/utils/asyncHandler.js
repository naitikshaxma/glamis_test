const asyncHandler = (fnToExecute) => {
    return async (req, res, next) => {
        try {
            fnToExecute(req, res, next)
        } catch (error) {
            console.error(new Date().toLocaleString(), error.message)
            res.status(error.code || 500).json({
                success: false,
                message: error.message
            })
        }
    }
}


export { asyncHandler }

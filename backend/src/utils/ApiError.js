const ApiError = (statusCode, message = "Something Went Wrong") => {
    return {
        statusCode,
        message
    }
}

module.exports = { ApiError }
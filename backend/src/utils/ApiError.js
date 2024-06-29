const ApiError = (statusCode, message = "Something Went Wrong") => {
    return {
        statusCode,
        message
    }
}

export { ApiError };
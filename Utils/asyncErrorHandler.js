// Middleware function to catch asynchronous errors in route handlers
module.exports = (func) => {
    // Return a new middleware function
    return (req, res, next) => {
        // Execute the provided async route handler function and catch any errors
        func(req, res, next).catch(err => next(err));
    }
}

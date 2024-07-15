export const ErrorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "Internal Server Error");
    err.StatusCode || (err.StatusCode = 500);
    if (err.name === "CastError")
        err.message = "Invalid ID";
    return res.status(err.StatusCode).json({
        success: false,
        message: err.message,
    });
};
export const TryCatch = (func) => (req, res, next) => {
    return Promise.resolve(func(req, res, next)).catch(next);
};

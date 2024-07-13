export default function ErrorMiddleware(err, req, res, next) {
    err.message || (err.message = "Internal Server Error");
    err.StatusCode || (err.StatusCode = 500);
    return res.status(err.StatusCode).json({
        success: false,
        message: err.message,
    });
}
export const TryCatch = (func) => (req, res, next) => {
    return Promise.resolve(func(req, res, next)).catch(next);
};

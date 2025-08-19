export const asyncHandler = (fn) => {
    return async (req, res, next) => {
        await fn(req, res, next).catch(error => {
            return next(error , {cause:500})
        })
        
    }
    
}
export const globalErrorHandling = (error, req, res, next) => {
    return res.status(error.cause || 400).json({
        message: error.message,

        stack: process.env.MOOD === 'DEV' ?error.stack :undefined
    })

}
export const successResponse = ({ res, status = 200, message = 'done', data = {} }) => {
    res.status(status).json({message , data})
    
}


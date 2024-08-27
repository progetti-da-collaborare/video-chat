const jwt = import('jsonwebtoken')
const config = import('../config.js')
const {secret, tokenGIT} = config
import * as er from "../errors/ErrorServer.js"

export default function errorMiddleWare(err, req, res, next) {
    if(res.headersSent) {
        return next(err)
    }

    if(err instanceof er.ErrorServer)
        res.status(err.status || 400).json({message: err.message, stack: err.stack, errLevel: err.errLevel})
    else
        res.status(err.status || 400).json({message: err.message, stack: err.stack})
}
import { ErrorHttpConnection } from '../errors/ErrorServer.js'

const jwt = import('jsonwebtoken')
const config = import('../config.js')
const {secret, tokenGIT} = config

export default function authMiddleWare(req, res, next) {
    if(req.method === 'OPTIONS') {
        next()
    }

    try {
        const token = req.headers.authorisation.split(' ')[1]
        if(!token) {
            return res.status(403).json({message: "Пользователь не авторизован"})
        }
        const decodedData = jwt.verify(token, secret)
        if(decodedData.only)
            decodedData.only.forEach( a => {
                if(!req.url.match(a)) throw new ErrorHttpConnection("Endpoint access forbidden")
            })
        //req.user = decodedData
        next()
    } catch(e) {
        console.log(e)
        return res.status(403).json({message: "Пользователь не авторизован"})
    }
}
import jwt from 'jsonwebtoken'
import config from '../config.js'
const {secret, tokenGIT} = config

export default function roleMiddleWare(roles) {
    return function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next()
        }

        try {
            //const token = req.headers.authorisation.split(' ')[1]
            const token = req.cookies["accessToken"]
            if (!token) {
                console.log(token)
                return res.status(403).json({message: "Пользователь не авторизован"})
            }
            const {roles: userRoles} = jwt.verify(token, secret)
            let hasRole = false
            userRoles.forEach(role => {
                if(roles.includes(role)) {
                    hasRole = true
                }
            })
            if(!hasRole) {
                return res.status(403).json({message: "У вас нет доступа"})
            }
            next()
        } catch (e) {
            console.log(e)
            if(res) return res.status(403).json({message: "Пользователь не авторизован"})
            throw new Error("Ошибка авторизации")
        }
    }
}
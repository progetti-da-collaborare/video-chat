import {userModel, roleModel, contactModel} from './../../models/models.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from './../../config.js'
const {secret, tokenGIT} = config

import { ErrorHttpConnection, ErrorServer } from '../../errors/ErrorServer.js'

import { ErrLevel } from '../../errors/ErrorServer.js'

//Token for wide access and http only, through cookies
const generateAccessToken = (id, roles) => {
    return jwt.sign({id, roles}, secret, {expiresIn: "24h"})
}
//Token for access only socket operations, exposed in response message
const generateAccessTokenOnlyChat = (id, roles) => {
    return jwt.sign({id, roles, only: [/\/crt\//]}, secret, {expiresIn: "24h"})
}

class AuthController {
    async registration(req, res, next) {
        try {
            const {username, password, email} = req.body
            const candidate = await userModel.findOne({username})
            if(candidate)
                throw new ErrorServer("The username isn't allowed")
            const hashPassword = bcrypt.hashSync(password, 7)
            const hashEmail = bcrypt.hashSync(email, 7)
            //const userRole = await roleModel.findOne({value: "ADMIN"})
            const userRole = await roleModel.find({value: {"$in": ["ADMIN", "USER"]}})
            const user = new userModel({username, email: hashEmail, password: hashPassword, roles: userRole.map(a => a.value)})
            await user.save()
            return res.json({message: "Пользователь успешно зарегистрирован"})
        } catch(e) {
            next(e)
        }
    }

    async loginNicknamePassword(req, res, next) {
        try {
            const {username, password} = req.body
            const user = await userModel.findOne({username})
            //const token_ = jwt.sign({email: "butorina@school80.spb.ru", username: "Natalja"}, secret, {expiresIn: "24h"})
            if(!user)
                throw new ErrorHttpConnection(`No user ${username} is registered`, ErrLevel.LOUD)
            const isPasswordValid = bcrypt.compareSync(password, user.password)
            if(!isPasswordValid)
                throw new ErrorHttpConnection(`Authorisation error`)
            const token = generateAccessToken(user._id, user.roles)
            const tokenOnlyChat = generateAccessTokenOnlyChat(user._id, user.roles)
            //maxage - от нулевого меридиана похоже, 3 часа разница
            res.cookie('accessToken', token, { maxAge: (3 + 24/*сутки*/)*60*60*1000, httpOnly: true });
            res.json({tokenOnlyChat})
        } catch(e) {
            next(e)
        }
    }

    //Authorisation through firebase
    async loginNicknameEmail(req, res, next) {
        try{
            //const token_ = jwt.sign({email: "butorina@school80.spb.ru", username: "Natalja"}, secret, {expiresIn: 60 * 60 * 24 * 366})
            const {tokenGH} = req.body
            const {email, username} = jwt.verify(tokenGH, secret)
            const user = await userModel.findOne({username})
            if(!user)
                throw new ErrorHttpConnection(`No user ${username} is registered`, ErrLevel.LOUD)
            const isEmailValid = bcrypt.compareSync(email, user.email)
            if(!isEmailValid)
                throw new ErrorHttpConnection(`Authorisation error`)
            const token = generateAccessToken(user._id, user.roles)
            const tokenOnlyChat = generateAccessTokenOnlyChat(user._id, user.roles)
            //maxage - от нулевого меридиана похоже, 3 часа разница
            res.cookie('accessToken', token, { maxAge: (3 + 24/*сутки*/)*60*60*1000, httpOnly: true });
            res.json({tokenOnlyChat})
        } catch (e) {
            next(e)
        }
    }

}

const authController = new AuthController()
export default authController
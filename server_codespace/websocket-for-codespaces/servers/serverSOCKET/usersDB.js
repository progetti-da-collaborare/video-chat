import {callModel} from './../../models/models.js'
import { callGroupModel } from './../../models/models.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from './../../config.js'
const {secret, tokenGIT} = config

import axios from 'axios'
import jsdom from "jsdom"
const { JSDOM } = jsdom
import dotenv from 'dotenv/config'
import {ObjectId} from 'mongodb'    // or ObjectID
import { json } from 'express'
import { CallGroup } from './../../models/CallGroup.js'
import * as er from '../../errors/ErrorServer.js'

/*
{id: id клиента,
 name: никнейм,
 approved: true/false - после заявки по сокетному соединнию отправляется запрос на авторизацию с ,
 auth_code - заново генерируемый каждый раз для регистрации перед соединением
}
- Сервер http (содержит express nodejs) codespace запускается в action в ответ на push (использовать как лог запуска)
- rtc/init-connect - инициализация сеанса связи. Если сервер не запущен - запускается.
На том же порту, что и http, подключается отдельно WebSocketServer для обратной связи с клиентом.
Запуск сервера (если остановлен) - с учетом авторизации (чтобы не запускали посторонние)
 запуск http сервера
- rtc/start-socket-server - запуск socket сервера
- rtc/check/init-connect - проверка прав на инициацию сеанса связи,
- rtc/check/join-connect - проверка прав на подключение к сеансу связи,
*/
/*
const generateAccessToken = (id, roles) => {
    return jwt.sign({id, roles}, secret, {expiresIn: "24h"})
}
*/

function getObjectKey(obj, value){return Object. keys(obj). filter((key)=> obj[key] === value);}

class UsersDB {
    static #max = 10000000000
    static #generateId = () => {
        return JSON.stringify(Math.floor(Math.random() * UsersDB.#max) )
    }

    #clients

    constructor() {
        // подключённые клиенты
        //ключ-значение: {id, {nickname, ws}}
        this.#clients = {}
    }

    async addSocketConnection(data) {
        try {
            const {ws, idMe} = data
                if(!ws) throw er.ErrorServer("addSocketConnection")
            const id = idMe     //UsersDB.#generateId()
            this.#clients[id] = {ws: ws}
            return {message: "Пользователь успешно зарегистрирован", id: id}
        } catch(e) {
            console.log(e)
            return {message: "addSocketConnection error"}
        }
    }

    async getSocketConnectionById(id) {
        try {
            return this.#clients[id]
        } catch(e) {
            console.log(e)
            return {message: "getSocketConnectionById error"}
        }
    }

    async deleteAllSocketConnections() {
        try {
            this.#clients = {}
        } catch(e) {
            console.log(e)
            return {message: "deleteAllConnections error"}
        }
    }
    
    async deleteSocketConnectionById(id) {
        try {
            delete this.#clients[id]
        } catch(e) {
            console.log(e)
            return {message: "deleteAllConnections error"}
        }
    }

    async deleteSocketConnectionByWs(ws) {
        try {
            const arr = getObjectKey(this.#clients, ws)
            arr.map(a => delete this.#clients[a])
        } catch(e) {
            console.log(e)
            return {message: "deleteAllConnections error"}
        }
    }
}

const usersDB = new UsersDB()
export default usersDB
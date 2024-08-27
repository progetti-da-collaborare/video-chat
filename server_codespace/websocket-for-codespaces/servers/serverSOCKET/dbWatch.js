/**
 * Обработка событий изменения данных и отправка пользователю
 */
import {callGroupModel} from './../../models/models.js'
import usersDB from './usersDB.js'
import userWatch from './userWatch.js'
//Данные по сокетным подключениям
/**
 * {idUser: {nickName: name, idGroup: []}}
 *      idUser - уникальный номер для юзера, выделяется при подключении к сокетному соединению
 *      nickName - имя для отображения
 *      idGroup - массив групп, к которым подключается трансляция
 *      ws - объект соединения на стороне сервера для юзера
 */
/**
 * 1. Создается созвон в базе данных
 * 2. В форме react вводится id созвона и никнейм для отображения другим участникам
 * 3. Сначала отправляется в url (не защищено) id созвона (или даже несколько id?) и происходит событие upgrade и connection
 * 4. Через готовое сокетное соединение (защищено) отправляется сгенерированный id пользователя (позволяет отличать пользователей, никнеймы могут быть разные, если не требовать регистрацию)
 *    В принципе можно через сокетное соединение запрашивать и пароль
 * 5. С указанием id отправляются данные на сервер для организации связи webRTC
 * 
 * В группе дозвона все друг друга видят, поэтому возможно удобно в url иметь возможность передавать 
 */

//Ранее написаны размышления и планы, реализация может отличаться

//Связь id пользователя и сокетного соединения
//Остальное в бд
//idUser: ws

class DbWatch {
    constructor() {
        this.changeStream = null
        /*this.filter = [{
            "$match": {
                "$and": [{"updateDescription.updatedFields.calls.$[].callee": { "$exists": "true" } }, 
                       { "operationType": "update" }]
                }
            }]*/
            this.filter = [{
                "$match": {
                    '$and': [
                        //{'updateDescription.updatedFields.caller': "/^caller$/"},
                        //{'updateDescription.truncatedArrays.callee': {"$exists": 'true'}},
                        //{'changedDocument.k': "/caller/"},
                        //{'removedFields': {'$in': ['tags']}},
                        {'operationType': {'$in':["insert", "update", "replace", "delete"]}},
                    ],
                }
                }]
        
        this.options = { fullDocument: 'updateLookup' }
    }


    async addSocketConnection(data) {
        console.log('addConnection')
        return await usersDB.addSocketConnection(data)
    }

    async closeSocketConnectionById(id) {
        console.log('соединение закрыто')
        return await usersDB.deleteSocketConnectionById(id)
    }

    async closeSocketConnectionByWs(ws) {
        console.log('соединение закрыто')
        return await usersDB.deleteSocketConnectionByWs(ws)
    }
    
    async closeSocketConnections() {
        console.log('Все соединения закрыты')
        return await usersDB.deleteAllSocketConnections()
    }

    async setWatch() {
        //this.changeStream = callGroupModel.watch([], this.options)
        //this.changeStream = callGroupModel.watch([], this.filter)
        this.changeStream = callGroupModel.watch(this.filter, this.options)
        /*
        this.changeStream = callGroupModel.watch(
            [
                {
                  "$match": {
                    "operationType": {
                      "$in": [
                        "update"
                      ]
                    }}}]
        )*/
       //Without 'async' not function as calls aren't scheduled
        this.changeStream.on('change', async snapshot => userWatch.onGetBDSnapShot(snapshot));
    }

    async closeWatch() {
        await this.changeStream.close()
    }
}

const dbWatch = new DbWatch()
export default dbWatch
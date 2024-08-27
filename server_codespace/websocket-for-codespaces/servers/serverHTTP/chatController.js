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
const max = 10000000000
// подключённые клиенты
//ключ-значение: никнейм-ws
import usersDB from '../serverSOCKET/usersDB.js'

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

const generateAccessToken = (id, roles) => {
    return jwt.sign({id, roles}, secret, {expiresIn: "24h"})
}

const generateId = () => {
    return Math.floor(Math.random() * max)
}


class ChatController {
    async videoRTC(req, res) {
        try {
            const {username, password} = req.body
            const candidate = await userModel.findOne({username})
            if(candidate) {
                return res.status(400).json({message: "Пользователь с таким именем уже существует"})
            }
            const hashPassword = bcrypt.hashSync(password, 7)
            const userRole = await roleModel.findOne({value: "ADMIN"})
            const user = new userModel({username, password: hashPassword, roles: [userRole.value]})
            await user.save()
            return res.json({message: "Пользователь успешно зарегистрирован"})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: "Registration error"})
        }
    }

    async checkIdUserUnique(req, res) {
        try {
            const {idMe} = req.body
            const check = usersDB.getSocketConnectionById(idMe)
            return check ? 
                res.status(200).json({
                    message: "idMe check passed",
                    idMe: idMe}) :
                res.status(400).json({
                    message: "idMe check failed",
                    idMe: idMe})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка checkIdUserUnique: ${e.message}`})
        }
    }
///////////////////////////////
/////////// GROUP /////////////
///////////////////////////////
//Добавить пустую группу созвона
    async addCallGroup(req, res) {
        try {
            const {idMe, title, name} = req.body
            const callGroup = new callGroupModel()
            callGroup.callGroup.push( {idUser: idMe, name: name || "anonimo"} )
            callGroup.title = title || "senza titolo"
            await callGroup.save()
            return res.json({
                message: "Создана группа созвона",
                id: callGroup.id})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка addCallGroup: ${e.message}`})
        }
    }

    async getCallGroup(req, res) {
        try {
            const call = await callGroupModel.findById({_id: req.params.id})
            return res.json(call)
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка getCallGroup: ${e.message}`})
        }
    }

    async deleteCallGroup(req, res) {
        try {
            //const a = await callGroupModel.deleteMany({nickname:"anonimo"})
            const a = await callGroupModel.deleteOne({_id: req.params.id})
            return res.json(a)
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка deleteCallGroup: ${e.message}`})
        }
    }

    async deleteAllCallGroup(req, res) {
        try {
            const a = await callGroupModel.deleteMany({})
            return res.json(a)
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка deleteAllCallGroup: ${e.message}`})
        }
    }
///////////////////////////////
//////////// CALL /////////////
///////////////////////////////
//Добавить id нового пользователя и массив парных соединений нового пользователя и имеющихся в группе созвона 
    async addCalls(req, res) {
        try {
            const {idMe, name} = req.body
            const callGroup = await callGroupModel.findById(req.params.idGroup)
            //if(callGroup.callGroup.includes(idMe)) throw new Error("The id is already registered")
            callGroup.callGroup.forEach(a => {
                if(a.idUser === idMe) throw new Error("The id is already registered")
            })
            /*
            const nickPresent = callGroup.calls.map(a => a.callee)
            const nicknames = req.body.nicknames.filter(a => nickPresent.indexOf(a) === -1)
            nicknames.forEach(a => {
                const newCall = {}
                newCall.callee = a
                callGroup.calls.push(newCall)
            })
            */
            callGroup.callGroup.map(a => {
                const elem = new callModel({idUserOffer: idMe, idUserAnswer: a.idUser});
                callGroup.rtc.push(elem)
            });
            callGroup.callGroup.push({idUser: idMe, name: name || "anonimo"});
            await callGroup.save()
            return res.json({
                message: `Добавлен участник созвона ${idMe}`,
                id: idMe
            })
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка addCalls: ${e.message}`})
        }
    }

    async getCalls(req, res) {/*
        try {
            const group = await callGroupModel.findById({_id: req.params.idGroup})
            const call = group.calls.filter(a => req.body.nicknames.indexOf(a.callee) !== -1)
            return res.json(call)
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка getCall: ${e.message}`})
        }*/
        res.status(200).json({message: `The endpoint is not implemented`})
    }

    async deleteCalls(req, res) {
    //Удалить из созвона пользователей с id указанными в массиве
        try {
            const idsRemove = req.body.idUsers || [];
            /*
            const group = await callGroupModel.findById({_id: req.params.idGroup});
            const ids = group.callGroup.filter(a => idsRemove.indexOf(a) === -1);
            const cons = group.rtc.filter(a => idsRemove.indexOf(a.idUserOffer) === -1 && idsRemove.indexOf(a.idUserAnswer) === -1);
            await callGroupModel.updateOne({_id: req.params.idGroup}, {$set: {callGroup: ids}});
            await callGroupModel.updateOne({_id: req.params.idGroup}, {$set: {rtc: cons}});
            */
            /*
            const idsRemove = req.body.idUsers || [];
            const group = await callGroupModel.findById({_id: req.params.idGroup});
            const ids = group.callGroup.filter(a => idsRemove.indexOf(a) === -1);
            const cons = group.rtc.filter(a => idsRemove.indexOf(a.idUserOffer) === -1 && idsRemove.indexOf(a.idUserAnswer) === -1);
            */
           /*
            await callGroupModel.updateOne(
                {_id: req.params.idGroup}, 
                {$pull: {"callGroup": {"$in": idsRemove}}});
            const callGroup = await callGroupModel.findById(req.params.idGroup);
            await callGroupModel.updateOne(
                {_id: req.params.idGroup},
                {$pull: {"rtc": {"idUserOffer": {"$in": idsRemove}}}});
            await callGroupModel.updateOne(
                {_id: req.params.idGroup},
                {$pull: {"rtc": {"idUserAnswer": {"$in": idsRemove}}}});
                */
            await callGroupModel.updateOne(
                {_id: req.params.idGroup}, 
                {$pull: {"callGroup": {"idUser": {"$in": idsRemove}}, "rtc": {"$or":[{"idUserOffer": {"$in": idsRemove}}, {"idUserAnswer": {"$in": idsRemove}}]}}});
               /*
            await callGroupModel.updateOne(
                {_id: req.params.idGroup}, 
                {$pull: {"rtc": {"$or":[{"idUserOffer": {"$in": idsRemove}}, {"idUserAnswer": {"$in": idsRemove}}]}}});
            await callGroupModel.updateOne(
                {_id: req.params.idGroup}, 
                {$pull: "callGroup.$[elem]"},
                {arrayFilters: [
                    //{ "$or":[{"$and":[{"elem.idUserOffer": {"$eq": id1}}, {"elem.idUserAnswer": {"$eq": id2}}]}, {"$and":[{"elem.idUserOffer": {"$eq": id2}}, {"elem.idUserAnswer": {"$eq": id1}}]}]}
                    {"elem.idUser": {"$in": idsRemove}}]}
                );
                */
            return res.json(idsRemove);
        } catch(e) {
            console.log(e);
            res.status(400).json({message: `ошибка deleteCall: ${e.message}`});
        }
    }
//////////////////////////////////////
/////////// OFFER-ANSWER /////////////
//////////////////////////////////////
    async addOffer(req, res) {
        try {
            const {offer, idMe, idFriend} = req.body
            const y = new ObjectId()    //При вставке объекта у него нет id, (при push в массив добавляется _id). Для поиска объекта при watchDB нужен id
            offer._id = y
            //const candidate = await callModel.findOne({username})
            //const call = await callGroupModel.findById({_id: req.params.idGroup})
            let p = await callGroupModel.updateOne(
                //{ "$or":[{"$and":[{"rtc.$.idUserOffer": {"$eq": id1}}, {"rtc.$.idUserAnswer": {"$eq": id2}}]}, {"$and":[{"rtc.$.idUserOffer": {"$eq": id2}}, {"rtc.$.idUserAnswer": {"$eq": id1}}]}]},
                //{"rtc.offer":{"$exists":"true"}},
                /*
                {"$or":[{"rtc.$.idUserOffer": {"$eq": id1}}]},
                {$set: {"rtc.$.offer": offer}})
                */
                //{"$and":[{"rtc.idUserOffer": {"$eq": id1}}, {"rtc.idUserAnswer": {"$eq": id2}}], "$and":[{"rtc.idUserOffer": {"$eq": id1}}, {"rtc.idUserAnswer": {"$eq": id2}}]},
                {_id: req.params.idGroup},
                {$set: {"rtc.$[elem].offer": offer}},
                {arrayFilters: [
                    //{ "$or":[{"$and":[{"elem.idUserOffer": {"$eq": id1}}, {"elem.idUserAnswer": {"$eq": id2}}]}, {"$and":[{"elem.idUserOffer": {"$eq": id2}}, {"elem.idUserAnswer": {"$eq": id1}}]}]}
                    {"$and":[{"elem.idUserOffer": {"$eq": idMe}}, {"elem.idUserAnswer": {"$eq": idFriend}}]}    //
                 ]} )
            return res.json({message: `offer добавлен, ${JSON.stringify(p)}`})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка добавления offer: ${e.message}`})
        }
    }

    async addAnswer(req, res) {
        try {
            const {answer, idMe, idFriend} = req.body
            const y = new ObjectId()    //При вставке объекта у него нет id, (при push в массив добавляется _id). Для поиска объекта при watchDB нужен id
            answer._id = y
            //const candidate = await callModel.findOne({username})
            //const call = await callGroupModel.findById({_id: req.params.idGroup})
            await callGroupModel.updateOne(/*
                { "$or":[{"$and":[{"rtc.$.idUserOffer": id1}, {"rtc.$.idUserAnswer": id2}]}, {"$and":[{"rtc.$.idUserOffer": id2}, {"rtc.$.idUserAnswer": id1}]}]},
                {$set: {"rtc.$.answer": {type:"23"}}})*/
                {_id: req.params.idGroup},
                {$set: {"rtc.$[elem].answer": answer}},
                {arrayFilters: [
                    //{ "$or":[{"$and":[{"elem.idUserOffer": {"$eq": id1}}, {"elem.idUserAnswer": {"$eq": id2}}]}, {"$and":[{"elem.idUserOffer": {"$eq": id2}}, {"elem.idUserAnswer": {"$eq": id1}}]}]}
                    {"$and":[{"elem.idUserOffer": {"$eq": idMe}}, {"elem.idUserAnswer": {"$eq": idFriend}}]}
                 ]} )
            return res.json({message: "answer добавлен"})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка добавления answer: ${e.message}`})
        }
    }
////////////////////////////////////
/////////// CANDIDATES /////////////
////////////////////////////////////
    async addOfferCandidate(req, res) {
        try {/*
            const id = req.params.idCall
            const {offer} = req.body
            const call = await callModel.findById({_id: req.params.idCall})
            call.offerCandidates.push.offerCandidates.push(offer)
            call.save()
            */
           /*
            const {offer} = req.body
            callModel.updateOne(
                { _id: req.params.idCall },
                { $push: { "offerCandidates.$": JSON.stringify(offer) } }
            )
            */
            const {offerCandidates, idMe, idFriend} = req.body
            /*
            const callGroup = await callGroupModel.findById(req.params.idGroup)
            const call = callGroup.calls.find(a => a.callee === req.params.nickname)
            call.offerCandidates.push(candidate)
            await callGroupModel.save()
            return res.json({
                message: "Добавлены кандидаты созвона",
                id: callGroup.id
            })
            */
            await callGroupModel.updateOne(
                {_id: req.params.idGroup},
                {$push: {"rtc.$[elem].offerCandidates": {$each: offerCandidates}}},
                {arrayFilters: [
                    //{ "$or":[{"$and":[{"elem.idUserOffer": {"$eq": id1}}, {"elem.idUserAnswer": {"$eq": id2}}]}, {"$and":[{"elem.idUserOffer": {"$eq": id2}}, {"elem.idUserAnswer": {"$eq": id1}}]}]}
                    {"$and":[{"elem.idUserOffer": {"$eq": idMe}}, {"elem.idUserAnswer": {"$eq": idFriend}}]}
                 ]} )
            return res.json({message: "offer candidate добавлен"})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка addOfferCandidate: ${e.message}`})
        }
    }

    async nullOfferCandidate(req, res) {
        try {
            const {idMe, idFriend} = req.body
            let p = await callGroupModel.updateOne(
                {_id: req.params.idGroup},
                {$set: {"rtc.$[elem].offerCandidates": []}},
                {arrayFilters: [
                    { "$or":[{"$and":[{"elem.idUserOffer": {"$eq": idMe}}, {"elem.idUserAnswer": {"$eq": idFriend}}]}, {"$and":[{"elem.idUserOffer": {"$eq": idFriend}}, {"elem.idUserAnswer": {"$eq": idMe}}]}]}
                 ]} )
            return res.json({message: "Удалены offer кандидаты созвона"})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка nullOfferCandidate: ${e.message}`})
        }
    }

    async addAnswerCandidate(req, res) {
        try {
            const {answerCandidates, idMe, idFriend} = req.body

            await callGroupModel.updateOne(
                {_id: req.params.idGroup},
                {$push: {"rtc.$[elem].answerCandidates": {$each: answerCandidates}}},
                {arrayFilters: [
                    //{ "$or":[{"$and":[{"elem.idUserOffer": {"$eq": id1}}, {"elem.idUserAnswer": {"$eq": id2}}]}, {"$and":[{"elem.idUserOffer": {"$eq": id2}}, {"elem.idUserAnswer": {"$eq": id1}}]}]}
                    {"$and":[{"elem.idUserOffer": {"$eq": idMe}}, {"elem.idUserAnswer": {"$eq": idFriend}}]}
                 ]} )
            return res.json({message: "answer candidate добавлен"})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка addAnswerCandidate: ${e.message}`})
        }
    }

    async nullAnswerCandidate(req, res) {
        try {
            const {idMe, idFriend} = req.body
            let p = await callGroupModel.updateOne(
                {_id: req.params.idGroup},
                {$set: {"rtc.$[elem].answerCandidates": []}},
                {arrayFilters: [
                    { "$or":[{"$and":[{"elem.idUserOffer": {"$eq": idMe}}, {"elem.idUserAnswer": {"$eq": idFriend}}]}, {"$and":[{"elem.idUserOffer": {"$eq": idFriend}}, {"elem.idUserAnswer": {"$eq": idMe}}]}]}
                 ]} )
            return res.json({message: "Удалены answer кандидаты созвона"})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `ошибка nullAnswerCandidate: ${e.message}`})
        }
    }
    
}

const chatController = new ChatController()
export default chatController
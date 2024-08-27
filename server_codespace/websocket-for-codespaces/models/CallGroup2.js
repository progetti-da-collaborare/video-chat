/**
 * Созвон группы пользователей
 */
/** БД
         * {
         *  { idCallGroup: ,
         *      callGroup: [ idUser,  ] , - заполняют инициатор или подключаемые
         *      rtc: [ {idUserOffer: , idUserAnswer: , offer: , answer: , offerCandidates: , answerCandidates: }, {}, {} ]
         *  }, {}, {}
         * } - создает инициатор соединения
*/
import { Schema, model } from 'mongoose'
import { Call2 } from './Call2.js';
import { Legend } from './Legend.js';
/*
const CallGroup2 = new Schema({callGroup: {type: [String], default: []},
                              rtc: {type: [Call2], default: []},
                              title: {type: String, default: "New group call"},
                              nickname: {type: String, default: "John Doe"}})
*/                              
const CallGroup2 = new Schema({callGroup: {type: [Legend], default: []},
    rtc: {type: [Call2], default: []},
    title: {type: String, default: "New group call"}})
/*
CallGroup2.set('toJSON', {
    transform: function (doc, ret) {   delete ret._id  }
});
CallGroup2.set('toObject', {
    transform: function (doc, ret) {   delete ret._id  }
});
*/
export {CallGroup2}
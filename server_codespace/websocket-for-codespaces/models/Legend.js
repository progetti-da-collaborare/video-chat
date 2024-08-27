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

const Legend = new Schema({idUser: String,
                           name: {type: String, default: "John Doe"}})
/*
CallGroup2.set('toJSON', {
    transform: function (doc, ret) {   delete ret._id  }
});
CallGroup2.set('toObject', {
    transform: function (doc, ret) {   delete ret._id  }
});
*/
export {Legend}
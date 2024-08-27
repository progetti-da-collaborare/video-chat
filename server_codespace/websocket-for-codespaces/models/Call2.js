/**
 * Сигнализация для WebRTC
 */
/** БД
         * {
         *  { idCallGroup: ,
         *      callGroup: [ idUser,  ] , - заполняют инициатор или подключаемые
         *      rtc: [ {idUserOffer: , idUserAnswer: , offer: , answer: , offerCandidates: , answerCandidates: }, {}, {} ]
         *  }, {}, {}
         * } - создает инициатор соединения
*/
import {Schema, model} from 'mongoose'

const Call2 = new Schema({
    idUserOffer: String,
    idUserAnswer: String,
    answerCandidates: [{candidate: {type: String, default: ""}, 
                        sdpMLineIndex: {type: Number, default: 0}, 
                        sdpMid: {type: String, default: ""}}],
    offerCandidates: [{candidate: {type: String, default: ""}, 
                       sdpMLineIndex: {type: Number, default: 0}, 
                       sdpMid: {type: String, default: ""}}],
    answer: {type: {type: String, default: ""}, 
             sdp: {type: String, default: ""}, 
             _id: {type: Schema.Types.ObjectId, required: false}},
    offer: {type: {type: String, default: ""}, 
            sdp: {type: String, default: ""}, 
            _id: {type: Schema.Types.ObjectId, required: false}}
})
/*
Call2.set('toJSON', {
    transform: function (doc, ret) {   delete ret._id  }
});
Call2.set('toObject', {
    transform: function (doc, ret) {   delete ret._id  }
});
*/
export {Call2}
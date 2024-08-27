/**
 * Сигнализация для WebRTC
 */
import {Schema, model} from 'mongoose'

const Call = new Schema({
    callee: String,
    answerCandidates: [{candidate: {type: String, default: ""}, 
                        sdpMLineIndex: {type: Number, default: 0}, 
                        sdpMid: {type: String, default: ""}}],
    offerCandidates: [{candidate: {type: String, default: ""}, 
                       sdpMLineIndex: {type: Number, default: 0}, 
                       sdpMid: {type: String, default: ""}}],
    answer: {type: {type: String, default: ""}, 
             sdp: {type: String, default: ""}},
    offer: {type: {type: String, default: ""}, 
            sdp: {type: String, default: ""}}
})

Call.set('toJSON', {
    transform: function (doc, ret) {   delete ret._id  }
});
Call.set('toObject', {
    transform: function (doc, ret) {   delete ret._id  }
});

export {Call}
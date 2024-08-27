/**
 * Созвон группы пользователей
 */
import { Schema, model } from 'mongoose'
import { Call } from './Call.js';

const CallGroup = new Schema({caller: {type: String, default: "unknown caller"}, 
                              calls: {type: [Call], default: []},
                              title: {type: String, default: "New group call"}})

Call.set('toJSON', {
    transform: function (doc, ret) {   delete ret._id  }
});
Call.set('toObject', {
    transform: function (doc, ret) {   delete ret._id  }
});

export {CallGroup}
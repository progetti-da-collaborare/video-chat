import {Schema, model} from 'mongoose'

export const Role = new Schema({
    value: {type: String, unique: true, default: 'USER'}
})

//module.exports = Role//model('Role', Role)
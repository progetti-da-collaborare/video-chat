import {Schema, model} from 'mongoose'

const Contact = new Schema({
    name: {type: String, unique: true, required: true},
    email: {type: String, required: true}
})

Contact.set('toJSON', {
    transform: function (doc, ret) {   delete ret._id  }
});
Contact.set('toObject', {
    transform: function (doc, ret) {   delete ret._id  }
});

//module.exports = Contact//model('Contact', Contact)
export {Contact}
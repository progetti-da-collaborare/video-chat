//for multiple connections need export schema not model
import {Schema, model} from 'mongoose'

const User = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    roles: [{type: String, ref: 'Role'}]
})

/*
User.virtual('iid').get(function(){
    return this._id.toHexString();
});
*/
User.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {   delete ret._id  }
});
User.set('toObject', {
    virtuals: true,
    transform: function (doc, ret) {   delete ret._id  }
});

// here you populate your virtual field before it gets returned to adminbro (find query)
/*
User.pre('find', function () {
    this.populate('id');
});
*/
//virtual "id" есть по умолчанию
/*
// Duplicate the ID field.
Schema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
Schema.set('toJSON', {
    virtuals: true
});
*/
/*
const userSchema = new mongoose.Schema({
    name: String,
    isActive: Boolean,
}, {
    versionKey: false,
    timestamps: true,
});

const todoSchema = new mongoose.Schema({
    title: String,
    completed: Boolean,
}, {
    versionKey: false,
    timestamps: true,
});
*/
//module.exports = User//model('User', User)

export {User}
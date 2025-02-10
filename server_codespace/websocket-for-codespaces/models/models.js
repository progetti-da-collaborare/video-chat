import {authConnection, docsConnection/*, authConnectionW, docsConnectionW*/} from './connections.js'
import {User} from './User.js'
import {Role} from './Role.js'
import {Contact} from './Contact.js'
import {Call2} from './Call2.js'
import {CallGroup2} from './CallGroup2.js'

//Авторизация
const userModel = authConnection.model('User', User);
const roleModel = authConnection.model('Role', Role);
//Данные

const contactModel = docsConnection.model('Contact', Contact);
const callModel = docsConnection.model('Call', Call2);
const callGroupModel = docsConnection.model('CallGroup', CallGroup2);
//const callGroupModelW = docsConnectionW.model('CallGroup', CallGroup2);
/*
const contactModel = authConnection.model('Contact', Contact);
const callModel = authConnection.model('Call', Call2);
const callGroupModel = authConnection.model('CallGroup', CallGroup2);
*/
export {
    userModel,
    roleModel,
    contactModel,
    callModel,
    callGroupModel,
    //callGroupModelW
};
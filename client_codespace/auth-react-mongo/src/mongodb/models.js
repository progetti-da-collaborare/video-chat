const {authConnection} = import('./connections');
const {User} = import('./User');

//Авторизация
const userModel = authConnection.model('User', User);

export {
    userModel,
};
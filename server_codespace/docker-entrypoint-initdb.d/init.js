console.log("qwerty-----")
db.auth('root', '12345678');

db = db.getSiblingDB("admin")
db.createUser({
    user: 'iUUGI77HGJ7',
    pwd: 'uig778GGY789hIUHGUYgyuyu_9',
    roles: [
      {
        role: 'readWrite',
        db: 'admin',
      },
    ],
  });

db = db.getSiblingDB("mongo_auth")
db.createUser({
    user: 'user',
    pwd: 'password',
    roles: [
      {
        role: 'readWrite',
        db: 'mongo_auth',
      },
    ],
  });
  db.createCollection('roles');
  db.createCollection('users');

db = db.getSiblingDB("mongo_docs")
db.createUser({
    user: 'user',
    pwd: 'password',
    roles: [
      {
        role: 'readWrite',
        db: 'mongo_docs',
      },
    ],
  });
  db.createCollection('callgroups');
  db.createCollection('calls');
  db.createCollection('contacts');

/*
const y = async () => {
    try {
        //db admin is default, let's create others
        db = db.getSiblingDB("mongo_auth")
        db = db.getSiblingDB("mongo_docs")
        const authController = await import('./servers/serverHTTP/authController.js').catch(error => {
            console.error('Script execution failed 1:', error);
        })
        const {userModel, roleModel, contactModel} = await import('./../../models/models.js').catch(error => {
            console.error('Script execution failed 2:', error);
        })

        await roleModel.insertMany(["USER", "ADMIN", "SUPER"])

        authController.reg({ username: "Natalia", password: "foidUGYSI788_77h", email: "hhh@mail.ru", roles: ["USER", "ADMIN"] })
            
    } catch(e) {
        console.log(e)
    }
}

y()
*/
/*
db.createCollection("roles")

db.createUser({
  'user': dbUser,
  'pwd': dbPwd,
  'roles': [
    {
      'role': 'dbOwner',
      'db': getEnvVariable('DB_NAME', 'MeanUrls')
    }
  ]
});
*/
// https://www.mongodb.com/docs/mongodb-shell/reference/methods/
// https://dev.to/jsheridanwells/dockerizing-a-mongo-database-4jf2
// https://github.com/GeoS74/wiki/blob/main/Запуск%20контейнера%20MongoDB%20с%20инициализацией.md
//connections to different databases
import mongoose from 'mongoose'
/*
module.exports = function connectionFactory() {
  const connAuth = mongoose.createConnection('mongodb+srv://Jaimlja:%5FGirolamo%5FCardano%5F13@cluster.tiqwl5f.mongodb.net/auth_roles?retryWrites=true&w=majority');

  connAuth.model('User', require('User'));
  connAuth.model('Role', require('Role'));

  return connAuth;
};
*/
function makeNewConnection(uri) {
  const db = mongoose.createConnection(uri);

  //this здесь относится к объекту db?
  db.on('error', function (error) {
      console.log(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`);
      db.close().catch(() => console.log(`MongoDB :: failed to close connection ${this.name}`));
  });

  db.on('connected', function () {
    //log all queries that mongoose fire in the application
      mongoose.set('debug', function (col, method, query, doc) {
          console.log(`MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`);
      });
      console.log(`MongoDB :: connected ${this.name}`);
  });

  db.on('disconnected', function () {
      console.log(`MongoDB :: disconnected ${this.name}`);
  });

  return db;
}


const authConnection = makeNewConnection('mongodb+srv://Jaimlja:%5FGirolamo%5FCardano%5F13@cluster.tiqwl5f.mongodb.net/auth_roles?retryWrites=true&w=majority');
const docsConnection = makeNewConnection('mongodb+srv://Jaimlja:%5FGirolamo%5FCardano%5F13@cluster.tiqwl5f.mongodb.net/documents?retryWrites=true&w=majority');

/*
const authConnection = makeNewConnection('mongodb://user:password@mongo:27017/mongo_auth');
//const docsConnection = makeNewConnection('mongodb://user:password@mongo:27017/admin?authSource=admin&directConnection=true');
*/

export {
  authConnection,
  //docsConnection,
};
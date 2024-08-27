import http from 'http'
import app from "./servers/serverHTTP/serverHTTP.js"
import serverSocket from "./servers/serverSOCKET/serverSOCKET.js"

const PORT = process.env.PORT || 8082
//to add avent upgrade
const server = http.createServer(app);
server.addListener("close", serverSocket.onCloseServer )

//Запрос сокетного соединения на фронтенде
//"credentials": "include" - бесполезны, т.к. куки вupgrade не передаются. Продумать авторизацию позже
server.on('upgrade', serverSocket.onUpgrade );

const start = async () => {
    try {
        //app.listen(PORT, () => console.log(`server started on port ${PORT}`))
        server.listen(PORT, () => console.log(`server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()
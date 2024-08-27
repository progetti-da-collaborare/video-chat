import url from 'url'
import dbWatch from "./dbWatch.js"
import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv/config'
import userWatch from './userWatch.js'

dbWatch.setWatch()

//server-socket
const wss = new WebSocketServer({ noServer: true } /*{port: process.env.port_socket}*/)
    wss.on('connection', async function(data) {
        const {ws, idMe} = data
        ws.on('message', userWatch.onGetUserMessage)
        ws.on('close', async () => { await dbWatch.closeSocketConnectionByWs(ws) } )
        await dbWatch.addSocketConnection({ws: ws, idMe: idMe})
        /*const {id} = await dbWatch.addSocketConnection({ws: ws, nickname: nickname})
        ws.send(JSON.stringify({idMe: id, type: "myUserId"}))*/
    });

    class ServerSocket {
    //Запрос сокетного соединения на фронтенде
    //"credentials": "include" - бесполезны, т.к. куки вupgrade не передаются. Продумать авторизацию позже
    //Сохраняется пара userId-webSocket
    onUpgrade(req, socket, head) {
        // ...
        try{
            //dbWatch.setWatch()
            //roleMiddleWare(['USER', 'ADMIN'])(req)
            /*Авторизация wrbsocket по cookies невозможна. Обычно по первому запросу*/
            //socketConnect()
            /*
            const urlObject = url.parse(req.url, true)
            const {nickname} = urlObject.query
            */
    /*
            fetch(
                'http://localhost:8082/check-token',
                {
                    "method": "POST",
                    body: JSON.stringify({answer: {type:"type hz", sdp: "sdp hz"}}),
                    "credentials": "include",
                    "headers": {
                            "Content-Type": "application/json"}
                }
            )
            .then((res) => {//Открываем сокетное соединение и 
                const code = res.status
                if(code >= 400) throw new Error("Пользователь не авторизован")*/
                /*
                import('./chatController.js')
    //      })
            .then(a =>
                {
                    wss = a.wss
                    //if(!!!wss) throw new Error("socket server not defined")
                    if(!!!wss) return fetch(
                        'http://localhost:8082/crt/socket',
                        {
                            "method": "POST",
                            body: JSON.stringify({nickname: nickname}),
                            "headers": {
                                    "Content-Type": "application/json"}
                        }
                    )
                })
            .then(() => wss.handleUpgrade(req, socket, head, function done(ws) {
                wss.emit('connection', ws);
            }))
            .catch(e => 
                console.log(e.message)    
            )
            */
                    wss.handleUpgrade(req, socket, head, function done(ws) {
                        const urlObject = url.parse(req.url, true)
                        const {id} = urlObject.query     //Имя пользователя и user id
                        console.log("новое соединение, idMe: " + id );
                        wss.emit('connection', {ws: ws, idMe: id});
                    })
        } catch(e) {
            console.log(e.message)
        }
    };

    async onCloseServer() {
        await dbWatch.closeSocketConnections();
        await dbWatch.closeWatch();
    }
}

const serverSocket = new ServerSocket()
export default serverSocket
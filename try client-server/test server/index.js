import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv/config'

var clients = {};
var wss = new WebSocketServer({
    port: process.env.port_socket
});

var decoder = new TextDecoder("utf-8");

function arrayBufferToString(buffer) {
    return decoder.decode(new Uint8Array(buffer));
}

wss.on('connection', function(ws) {
    var id = Math.random();
    while(!!clients[id]) id = Math.random();
    clients[id] = ws;
    console.log("новое соединение " + id);
    
    ws.on('message', function(message) {
        console.log('получено сообщение ' + message);
    
        for (var key in clients) {
            const v = arrayBufferToString(message.toJSON().data)
            const v2 = JSON.parse(v)
        clients[key].send(v);
        }
    });
    
    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        delete clients[id];
    });

});
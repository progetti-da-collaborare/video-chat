import assert from 'assert'
import {expect} from 'chai'
import WebSocket from 'ws'

/**
 * Создаются 2 сокетных соединения со стороны пользователя
 * через один отправляются сообщения, проверяются приходящие с обоих
 * send1 - массив посылаемых сообщений через первое соединение
 * send2 - массив посылаемых сообщений через второе соединение
 * 
 * Для обозначения остановки массива асинхронных сообщений на сервер отправляется сообщение с типом {type: "test"}
 */

function sendMessage(msg){
    // Wait until the state of the socket is not ready and send the message when it is...
    waitForSocketConnection(ws, function(){
        console.log("message sent!!!");
        ws.send(msg);
    });
}

// Make the function wait until the connection is made...
async function waitForSocketConnection(socket, callback, data){
    setTimeout(
        async function () {
            if (socket.readyState === 1 && data.idFriend && data.idFriend != 0) {
                console.log("Connection is made")
                if (callback != null){
                    await callback();
                }
            } else {
                console.log("wait for connection...")
                await waitForSocketConnection(socket, callback, data);
            }

        }, 5); // wait 5 milisecond for the connection...
}

async function waitForSocketConnections(socket1, socket2, callback){
    setTimeout(
        async function () {
            if (socket1.readyState === 1 && socket1.readyState === 1) {
                if (callback != null) await callback();
            } else {
                console.log("wait for connections...")
                await waitForSocketConnections(socket1, socket2, callback);
            }

        }, 1000); // wait 5 milisecond for the connection...
}

describe('Suite of socket unit tests', function() {

    let socketMe, socketFriend
    let idMe_ = 0, idFriend_ = 0
    let idGroupCall_ = 0
    let get_1 = {}, get_2 = {}
    let indSend = 0
    let typeMeOld = null
    let typeFriendOld = null
    let flag = 0

    const mas = [
    {//При создании соединения Upgrade->Connect-> генерация id для юзера на серверной стороне и отправка на фронтенд
        send1: [{get idMe(){ return idFriend_}, type: "done"}],
        send2: [{get idMe(){ return idMe_}, type: "done"}],
        get1: {get idMe(){ return idMe_}, type: "myUserId"},
        get2: {get idMe(){ return idFriend_}, type: "myUserId"}
    },
    {//Создание группы созвона и отправка идентификатора инициатору
        send1: [{get idMe(){ return idMe_}, type: "newGroupCall"}, 
                            {get idMe(){ return idFriend_}, type: "done"}],
        send2: [{get idMe(){ return idFriend_}, type: "ping"},     
                            {get idMe(){ return idMe_}, type: "done"}],
        get1: {get idGroupCall(){ return idGroupCall_}, type: "newGroupCall"},
        get2: {}
    },
    {//Внесение нового пользователя в группу созвона
        send1: [{get idMe(){ return idMe_}, type: "newGroupCall"},
                        {get idMe(){ return idMe_}, type: "ping"},
                                {get idMe(){ return idFriend_}, type: "done"}],
        send2: [{get idMe(){ return idFriend_}, type: "ping"},
                        {get idMe(){ return idFriend_}, type: "newCall", get idGroupCall(){ return idGroupCall_}},
                                {get idMe(){ return idMe_}, type: "done"}],
        get1: {get idGroupCall(){ return idGroupCall_}, type: "newCall"},
        get2: {get idGroupCall(){ return idGroupCall_}, type: "newCall"}
    },
    
    {//offer для группы созвона
        send1: [{get idMe(){ return idMe_}, type: "newGroupCall"}, //onmessage my -> fr
                        {get idMe(){ return idMe_}, type: "ping"},
                            {get idMe(){ return idMe_}, get idFriend(){ return idFriend_}, get idGroupCall(){ return idGroupCall_}, type: "newAnswer", answer: {type: "w", sdp: "h"}},
                                {get idMe(){ return idFriend_}, type: "done"}],
        send2: [{get idMe(){ return idFriend_}, type: "ping"},
                        {get idMe(){ return idFriend_}, type: "newCall", get idGroupCall(){ return idGroupCall_}},
                            {get idMe(){ return idFriend_}, type: "ping"},
                                {get idMe(){ return idMe_}, type: "done"}],
        //get1: {get idGroupCall(){ return idGroupCall_}, type: "newCall"},
        get1: {get idGroupCall(){ return idGroupCall_}, type: "newAnswer"},
        get2: {type: "newAnswer"/*, offer: {type: "", sdp: ""}*/}
    },]
/*
    beforeEach(function(done) {
        this.timeout(100000)/*
        this.timeout(100000)
        idMe_ = 0
        idFriend_ = 0
        idGroupCall_ = 0
        get_1 = {}
        get_2 = {}
        indSend = 0
        valMas = mas[indMas]
        socketMe = new WebSocket('http://localhost:8082' + `/?nickname=${"Me"}`);
        socketFriend = new WebSocket('http://localhost:8082' + `/?nickname=${"Friend"}`);
        socketMe.onopen = (e) => {
            console.log('socketMe connection opened');
        }
        socketFriend.onopen = (e) => {
            console.log('socketFriend connection opened');
        }
        socketMe.onclose = (e) => {
            console.log('socketMe connection closed');
        }
        socketFriend.onclose = (e) => {
            console.log('socketFriend connection closed');
        }
        socketMe.onmessage = async (e) => {
            const {idMe, type} = JSON.parse(e.data)
                if(type == "myUserId") idMe_ = idMe
            if(valMas.send1.length > indSend) {
                const y = {v: indSend}
                await waitForSocketConnection(socketFriend, () => socketFriend.send(JSON.stringify(valMas.send2[y.v])), {get idFriend(){return idFriend_}})
            }

            if(type == "done") done()
            else get_1 = JSON.parse(e.data)
        }

        socketFriend.onmessage = (e) => {
            const {idMe, type} = JSON.parse(e.data)
                if(type == "myUserId") idFriend_ = idMe
            if(valMas.send2.length > indSend) {
                socketMe.send(JSON.stringify(valMas.send1[indSend]))
                ++indSend
            }

            if(type == "done") done()
            else get_2 = JSON.parse(e.data)
        }
        done()
    });*/
/*
    afterEach(function(done) {
        this.timeout(100000)/*
        this.timeout(100000)
        // Cleanup
        if(socketMe.readyState == 1) {
            console.log('disconnecting socketMe...');
            socketMe.close();
        } else {
            // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
            console.log('no connection socketMe to break...');
        }

        if(socketFriend.readyState == 1) {
            console.log('disconnecting socketFriend...');
            socketFriend.close();
        } else {
            // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
            console.log('no connection socketFriend to break...');
        }

        done();
    });*/

    
        describe('Request pipes to check', function() {
            for(let i = 0; i < mas.length; ++i ){
                const valMas = mas[i]
                describe('Pipe ' + i /*JSON.stringify(valMas)*/, function() {
                    this.timeout(1000000)
                before(function(done) {
                    idMe_ = 0
                    idFriend_ = 0
                    idGroupCall_ = 0
                    get_1 = {}
                    get_2 = {}
                    indSend = 0
                    typeMeOld = null
                    typeFriendOld = null
                    flag = 0
                    socketMe = new WebSocket('http://localhost:8082' + `/?nickname=${"Me"}`);
                    socketFriend = new WebSocket('http://localhost:8082' + `/?nickname=${"Friend"}`);
                    socketMe.onopen = (e) => {
                        console.log('socketMe connection opened');
                    }
                    socketFriend.onopen = (e) => {
                        console.log('socketFriend connection opened');
                    }
                    socketMe.onclose = (e) => {
                        console.log('socketMe connection closed');
                    }
                    socketFriend.onclose = (e) => {
                        console.log('socketFriend connection closed');
                    }
                    socketMe.onmessage = async (e) => {
                        const {idMe, type, idGroupCall} = JSON.parse(e.data)
                        console.log("Me---" + e.data)
                            if(type == "myUserId") {
                                idMe_ = idMe
                                get_1 = JSON.parse(e.data)
                                return
                            }
                            if(type == "newGroupCall") idGroupCall_ = idGroupCall
                        if(type != "done" && type != "ping")
                            get_1 = JSON.parse(e.data)
                        
                        if(flag === 1) {
                            const y = {v: indSend}
                            ++indSend
                            flag = 0
                            await waitForSocketConnection(socketFriend, () => socketFriend.send(JSON.stringify(valMas.send2[y.v])), {get idFriend(){return idFriend_}})
                        }
                    }

                    socketFriend.onmessage = async (e) => {
                        const {idMe, type, idGroupCall} = JSON.parse(e.data)
                        console.log("Fr---" + e.data)
                            if(type == "myUserId")
                                idFriend_ = idMe
                            if(type == "newGroupCall") idGroupCall_ = idGroupCall
                        if(type != "done") {
                            if(type != "ping") get_2 = JSON.parse(e.data)
                            //socketMe.send(JSON.stringify(valMas.send1[indSend]))
                            const y = {v: indSend}
                            if(flag === 0) {
                                flag = 1
                                await waitForSocketConnection(socketMe, () => socketMe.send(JSON.stringify(valMas.send1[y.v])), {get idFriend(){return idMe_}})
                            }
                        }

                        if(type == "done") {
                            console.log("--------------------------done()")
                            done()
                        }
                    }
                    //waitForSocketConnections(socketFriend, socketMe, () => done())
                })
                after(function(done) {
                    // Cleanup
                    if(socketMe.readyState == 1) {
                        console.log('disconnecting socketMe...');
                        socketMe.close();
                    } else {
                        // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
                        console.log('no connection socketMe to break...');
                    }

                    if(socketFriend.readyState == 1) {
                        console.log('disconnecting socketFriend...');
                        socketFriend.close();
                    } else {
                        // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
                        console.log('no connection socketFriend to break...');
                    }
                    done()
                })
                it('Doing some things with indexOf()', function(done) {
                    //this.timeout(10000)
                    //setTimeout(() => {}, 50000)
                    Object.keys(valMas.get1).forEach( a => {
                        const r1 = valMas.get1[a]
                        const r2 = get_1[a]
                        //console.log(JSON.stringify(valMas.get1) + " = " + r1)
                        //console.log(JSON.stringify(valMas.get1) + " = " + r2)
                        console.log(r1 + " = " + r2)
                        console.log("-------" + JSON.stringify(valMas.get1))
                        expect(valMas.get1[a]).to.be.equal(get_1[a])
                    })
                    Object.keys(valMas.get2).forEach( a => {
                        const r1 = valMas.get2[a]
                        const r2 = get_2[a]
                        //console.log(JSON.stringify(valMas.get2) + " = " + r1)
                        //console.log(JSON.stringify(get_2) + " = " + r2)
                        console.log(r1 + " = " + r2)
                        console.log("-------" + JSON.stringify(get_2))
                        expect(valMas.get2[a]).to.be.equal(get_2[a])
                    })
                    done()
                });
                })
            }
        })

});



/*
        console.log("----------------------------------------------")
        this.timeout(100000)
        // Setup
        
        socket = io.connect('http://localhost:8082', {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket.on('connect', function() {
            console.log('worked...');
            done();
        });
        socket.on('disconnect', function() {
            console.log('disconnected...');
        })
        */


        /*
        it('Doing some things with indexOf()', function(done) {
            expect([1, 2, 3].indexOf(5)).to.be.equal(-1);
            expect([1, 2, 3].indexOf(0)).to.be.equal(-1);
            done();
        });

        it('Doing something else with indexOf()', function(done) {
            expect([1, 2, 3].indexOf(5)).to.be.equal(-1);
            expect([1, 2, 3].indexOf(0)).to.be.equal(-1);
            done();
        });
*/


/*
            const {idMe, idGroupCall} = JSON.parse(e.data)
            idMe_ = idMe
            console.log("===" + idMe_)
            idGroupCall_ = idGroupCall
            console.log("===" + idGroupCall_)
            console.log(e.data);
            console.log("qqqqqqqqqqqqqqqqqqqqqq");
            if(idMe_ != 0) socket.send(JSON.stringify({type: "newGroupCall", title: "my call group", idMe: idMe_}))
                if(!!idGroupCall) done()
            */

                    //done();
        /*
        while(socket.readyState != 1 ) nth()//console.log("_-_" + socket.readyState)
        socket.send(JSON.stringify({type: "newGroupCall", title: "my call group", idMe: idMe_}))
        while(idGroupCall_ == 0) nth()
        */
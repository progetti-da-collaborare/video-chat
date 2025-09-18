var pc = new RTCPeerConnection({
    iceServers: [
        {
          urls: "stun:stun.relay.metered.ca:80",
        },
        {
          urls: "turn:standard.relay.metered.ca:80",
          username: "b93da36ca91c3c2554a59bf1",
          credential: "55gk14o9CWOvrAC1",
        },
        {
          urls: "turn:standard.relay.metered.ca:80?transport=tcp",
          username: "b93da36ca91c3c2554a59bf1",
          credential: "55gk14o9CWOvrAC1",
        },
        {
          urls: "turn:standard.relay.metered.ca:443",
          username: "b93da36ca91c3c2554a59bf1",
          credential: "55gk14o9CWOvrAC1",
        },
        {
          urls: "turns:standard.relay.metered.ca:443?transport=tcp",
          username: "b93da36ca91c3c2554a59bf1",
          credential: "55gk14o9CWOvrAC1",
        },
    ],
  });

let localStream = null;
let remoteStream = null;

pc.onicecandidate = event => {
  const y = event.candidate
  const h = event.candidate.toJSON()
    event.candidate && event.candidate.toJSON();
  };

  // Create offer
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };


/*
  const submit= () => {
    fetch(
    'http://localhost:8082/auth/login',
    {
        "method": "POST",
        body: JSON.stringify({username:'user',password:'user'}),
        "credentials": "include",
        "headers": {
                  "Content-Type": "application/json"}
    }
        ).then(resp=>resp.text()).then(console.log)
  }*/
// создать подключение
const nick = "amenhotep"
let idMe = null
var socket = new WebSocket(`ws://localhost:8082/?nickname=${nick}`);

// отправить сообщение из формы publish
document.forms.publish.onsubmit = function() {
  var outgoingMessage = this.message.value;
  outgoingMessage = JSON.stringify({a:123, er: "qwe"})
  socket.send(outgoingMessage);
  //socket.credentials=true
  //createNewGroupCallSocket()
  return false;
};

// обработчик входящих сообщений
socket.onmessage = function(event) {
  var incomingMessage = event.data;
  var r = JSON.parse(incomingMessage)
  const {type} = r
  if(type == "myUserId") idMe = r.idMe
  showMessage(incomingMessage);
};

// показать сообщение в div#subscribe
async function showMessage(message) {
  var messageElem = document.createElement('div');
  //var b = await message.text().then(a => a);
  var b = message
  messageElem.appendChild(document.createTextNode(b));
  document.getElementById('subscribe').appendChild(messageElem);
}

const  createNewGroupCallSocket = async () => {
  //socket.send(JSON.stringify({type: "newGroupCall", idMe: idMe, title: "my call group"}));
  socket.event
}
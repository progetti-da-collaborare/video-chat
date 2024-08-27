import express from 'express'
import url from 'url'
import authRouter from './authRouter.js'
import fetchRouter from './fetchRouter.js'
import chatRouter from './chatRouter.js'
import serviceRouter from './serviceRouter.js'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv/config'
import errorMiddleWare from './../../middleWare/errorMiddleWare.js'
import checkMiddleWare from './../../middleWare/checkMiddleWare.js'

const app = express()

// 👇️ Handle uncaught exceptions
process.on('uncaughtException', function (err) {
    console.log(err);
  });

app.use(express.static('public'))

app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.json())
app.use(cookieParser())

app.use('/', function(req, res, next) {
    const allowedOrigins = ["http://localhost:3005", "http://localhost:3006"]
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    if (req.method === 'OPTIONS' || req.method === 'UPGRADE' || req.method === 'GET'  || req.method === 'POST') {
        res.header("Access-Control-Allow-Credentials", "true")
        //res.header("Access-Control-Allow-Headers", "X-Requested-With")
        res.header("Access-Control-Allow-Headers", "Content-type")
    }
    next();
});

/*
var corsOptions = {
    origin: /localhost:3005/,
    methods: "GET,HEAD,POST,OPTIONS,UPGRADE"
};
app.use(cors(corsOptions));
*/
app.use([checkMiddleWare])

app.use("/auth", authRouter)
app.use("/fetch", fetchRouter)
app.use("/crt", chatRouter)
app.use("/serv", serviceRouter)

app.use([errorMiddleWare])

export default app
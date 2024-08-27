const {userModel} = import('./models')
/*
const bcrypt = import('bcryptjs')
const jwt = import('jsonwebtoken')
const {validationResult} = import('express-validator')
const {secret, tokenGIT} = import('./config')

const axios = import('axios')
const jsdom = import("jsdom");
const { JSDOM } = jsdom;

const generateAccessToken = (id, roles) => {
    return jwt.sign({id, roles}, secret, {expiresIn: "24h"})
}
*/
class AuthController {
    /*
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка при регистрации", errors})
            }
            const {username, password} = req.body
            const candidate = await userModel.findOne({username})
            if(candidate) {
                return res.status(400).json({message: "Пользователь с таким именем уже существует"})
            }
            const hashPassword = bcrypt.hashSync(password, 7)
            const userRole = await roleModel.findOne({value: "ADMIN"})
            const user = new userModel({username, password: hashPassword, roles: [userRole.value]})
            await user.save()
            return res.json({message: "Пользователь успешно зарегистрирован"})
        } catch(e) {
            console.log(e)
            res.status(400).json({message: "Registration error"})
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body
            const user = await userModel.findOne({username})
            if(!user) {
                return res.status(400).json({message: `Пользователь ${username} не существует`})
            }
            const isPasswordValid = bcrypt.compareSync(password, user.password)
            if(!isPasswordValid) {
                return res.status(400).json({message: `Введен неверный пароль`})
            }
            const token = generateAccessToken(user._id, user.roles)
            //maxage - от нулевого меридиана похоже, 3 часа разница
            res.cookie('accessToken', token, { maxAge: (3 + 24)*60*60*1000, httpOnly: true });
            res.json({token})
        } catch(e) {
            console.log(e)
            res.body("").status(200).h
            res.status(400).json({message: "Login error"})
        }
    }
*/
    async getUsers() {
        try {
            /*
            const userRole = new roleModel()
            const adminRole = new roleModel({value: 'ADMIN'})
            await userRole.save()
            await adminRole.save()
            */
            const users = await new Promise((a)=> a(userModel.find({}/*, {username: 1, roles: 1}*/)))
            .then((a)=>a)
            console.log("users")
            //res.send(users)
            //const r = output("[]")
            //res.send(r)
            //res.render('contacts', {data: users})
        } catch(e) {

        }
    }
/*
    async getContacts(req, res) {
        try {
            const contacts = await contactModel.find({})
            //res.send(users)
            //const r = output("[]")
            //res.send(r)
            console.log(contacts)
            res.render('contacts', {data: contacts})
        } catch(e) {

        }
    }

    async getGitPage(req, res) {
        try{
            const owner = 'progetti-da-collaborare'
            //const repo = req.headers["repo"]
            //const path = req.headers["path"]
            const repo = req.query.repo
            const path = req.query.path
            const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
            const headers = {
              Authorization: `Bearer ${tokenGIT}`,
              Accept: 'application/vnd.github.v3.raw',
            };
            const response = await axios.get(url, { headers });
            //alert(response.data)
            //res.download("").
            
            const dom = new JSDOM(response.data);
            const content = dom.window.document.querySelector("body").innerHTML;
            dom.window.document.querySelector("body").innerHTML = 
                `<article class="text-class">${content}</article>
                <script src='/q/scripts.js', type='text/javascript' ></script>`;
            dom.window.document.querySelector("head").innerHTML = 
                `<link href="/q/index.css" rel="stylesheet">`;
            const content2 = dom.window.document.querySelector("html").innerHTML;
    console.log(content2);
            res.status(200).set({
                    'Content-Type': 'text/html'
            }).send(`<!DOCTYPE html><html>${content2}</html>`);
        } catch(e) {
            console.log(`ERROR: ${e.message}`)
        }
    }
    */
}

export const authController = new AuthController()
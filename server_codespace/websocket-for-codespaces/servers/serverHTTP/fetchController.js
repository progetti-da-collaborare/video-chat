import {userModel, roleModel, contactModel} from './../../models/models.js'
import config from './../../config.js'
const {secret, tokenGIT} = config

import axios from 'axios'
import jsdom from "jsdom"
import { ErrorHttpConnection, ErrorServer } from '../../errors/ErrorServer.js'
const { JSDOM } = jsdom

import { ErrLevel } from '../../errors/ErrorServer.js'

class FetchController {
    async getUsers(req, res, next) {
        try {
            /*
            const adminRole = new roleModel({value: 'SUPER'})
            await adminRole.save()
            */
            const users = await new Promise((a)=> a(userModel.find({}/*, {username: 1, roles: 1}*/))).
            then((a)=>a)
            console.log("users")
            //res.send(users)
            //const r = output("[]")
            //res.send(r)
            res.render('contacts', {data: users})
        } catch(e) {
            next(e)
        }
    }

    async getContacts(req, res, next) {
        try {
            /*
            const userRole = new roleModel()
            const adminRole = new roleModel({value: 'ADMIN'})
            await userRole.save()
            await adminRole.save()
            */
            const contacts = await contactModel.find({}/*, {username: 1, roles: 1}*/)
            //res.send(users)
            //const r = output("[]")
            //res.send(r)
            console.log(contacts)
            res.render('contacts', {data: contacts})
        } catch(e) {
            next(e)
        }
    }

    async getGitPage(req, res, next) {
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
/*            
           
            const dom = new JSDOM(response.data);
            const content = dom.window.document.querySelector("body").innerHTML;
            res.render('study-process', {data: content})
  */          
        } catch(e) {
            next(e)
        }
    }
}

const fetchController = new FetchController()
export default fetchController
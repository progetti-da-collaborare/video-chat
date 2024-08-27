import {userModel, roleModel, contactModel} from './../../models/models.js'
import config from './../../config.js'
const {secret, tokenGIT} = config

import { ErrorHttpConnection, ErrorServer } from '../../errors/ErrorServer.js'
import { ErrLevel } from '../../errors/ErrorServer.js'

class ServiceController {
    async hello(req, res, next) {
        try {
            return res.json({message: "Hello"})
        } catch(e) {
            next(e)
        }
    }

}

const serviceController = new ServiceController()
export default serviceController
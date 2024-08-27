const ErrLevel = {LOUD: "LOUD", SILENT: "SILENT"}

class ErrorServer extends Error {
    constructor(message, ...params) {
        super(message)
        const {cause, httpCode, errLevel} = params
        this.errLevel = (errLevel && errLevel in ErrLevel) ? errLevel : ErrLevel.SILENT
        this.status = httpCode ? httpCode : 400
        this.cause = cause ? `cause: ${cause}` : ""
        this.name = this.constructor.name
        this.toString = () => `${this.status}:Error message: ${this.message}` + this.cause + `, stack: ${this.stack}`
    }
}

class ErrorWebsocketConnection extends ErrorServer {
    constructor(message = "Websocket error.", ...params) {
        super(message, params)
    }
}

class ErrorHttpConnection extends ErrorServer {
    constructor(message = "Http error.", ...params) {
        super(message, params)
    }
}

class ErrorDBConnection extends ErrorServer {
    constructor(message = "Database error.", ...params) {
        super(message, params)
    }
}

export { ErrLevel, ErrorServer, ErrorWebsocketConnection, ErrorHttpConnection, ErrorDBConnection }
const ErrLevel = {LOUD: "LOUD", SILENT: "SILENT"}

class ErrorFront extends Error {
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

class ErrorWebsocketConnection extends ErrorFront {
    constructor(message = "Websocket error.", ...params) {
        super(message, params)
    }
}

class ErrorUserInput extends ErrorFront {
    constructor(message = "User Input error.", ...params) {
        super(message, params)
    }
}

class ErrorDetected extends ErrorFront {
    constructor(message = "Error.", ...params) {
        super(message, params)
    }
}

export { ErrLevel, ErrorFront, ErrorWebsocketConnection, ErrorUserInput, ErrorDetected }
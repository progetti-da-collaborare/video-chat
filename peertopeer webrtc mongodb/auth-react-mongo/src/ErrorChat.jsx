class ErrorChat extends Error {
    constructor(message) {
        super(message)
        this.name = "Chat error"
    }
}

export default ErrorChat
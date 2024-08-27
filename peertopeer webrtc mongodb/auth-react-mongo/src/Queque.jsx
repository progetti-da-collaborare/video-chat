class Queue {
    constructor(setTrigger) {
        this.collection = []
        this.setTrigger = setTrigger
    }

    trig = () => this.size()

    isEmpty = () => {
        return this.collection.length === 0
    }

    frontGet = () => {
        if(this.isEmpty()) return null
        //return this.collection[this.size() - 1]
        return this.collection[0]
    }
    
    push = (element) => {
        if(element && element.type) this.collection.push(element)
        this.setTrigger(this.trig())
    }

    pop = () => {
        if(this.isEmpty()) return null
        this.collection.pop()
        this.setTrigger(this.trig())
    }

    frontPop = () => {
        return this.isEmpty() ? null : (() => {this.collection.shift(); this.setTrigger(this.trig())})()
    }

    size = () => {
        return this.collection.length
    }
}

export default Queue
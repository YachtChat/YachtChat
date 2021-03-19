
export class User{
    constructor(id, connection, postion){
        this.id = id;
        this.connection = connection
        this.position = postion
        this.name = "Null"
    }
    getPosition(){
        return this.position
    }

    getConnection(){
        return this.connection
    }

    getRep(){
        return {
            "id": this.id,
            "name": this.name,
            "position": this.position.getRep()
        }
    }
}

export class Position{
    constructor(x, y, r){
        this.x = x
        this.y = y
        this.r = r
    }
    getRep(){
        return {
            "x": this.x,
            "y": this.y,
            "range": this.r
        }
    }
}

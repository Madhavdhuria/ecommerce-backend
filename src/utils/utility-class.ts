class Errorhandler extends Error {
    constructor(public message:string,public StatusCode :number) {
        super(message);
        this.StatusCode=StatusCode;
    }
}

export default Errorhandler;
class apiError extends Error{
    statuscode?:number;
    stack?: string | undefined;
    error?:string[];
    success?:boolean 
    constructor(
        message:string = "Something went wrong",
        statuscode:number,
        stack:string,
        error:string[] = [],
        success:boolean = false
    ){
        super(message)
        this.message = message
        this.statuscode = statuscode
        this.stack = stack,
        this.error = error
        this.success = success
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {apiError}
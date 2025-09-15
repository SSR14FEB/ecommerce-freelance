class ApiError extends Error{
    statuscode?:number;
    stack?: string | undefined;
    error?:string[];
    success?:boolean 
    constructor(
        statuscode:number|500,
        message:string = "Something went wrong",
        stack:string|"",
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

export {ApiError}
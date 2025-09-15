class ApiResponse{
    statuscode:number;
    message:string;
    success:boolean;
    data:object;
    constructor(
        statuscode:number,
        message:string,
        success:boolean = true,
        data:object = {},
    ){
        this.statuscode=statuscode;
        this.message = message;
        this.success = success;
        this.data = data 
    }
}

export {ApiResponse}
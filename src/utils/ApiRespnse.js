class ApiResponse {
    constructor (statusCode , data , message = "Success"){
        this.data = data
        this.statusCode=statusCode
        this.success = statusCode <400
        this.message = message
    }
}


export {ApiResponse}
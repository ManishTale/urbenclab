exports.responseJSON = (statusCode, status, data)=>{
    var result = {
        statusCode : statusCode,
        status: status,
        data: data
    }
    return result;
};
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
        username :  {
                type:String, 
                required : true
            },
            email : {
                type:String,
                required : true,
                unique: true, 
                validate: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, " Incorrect Email format! "] 
            },
            password : {
                type:String,
                required : true, 
                minlenngth: 6, 
                maxlength: 100
            },
            type : {
                type: String,
                required: true
            },
            token : String
});
module.exports = mongoose.model('users', User);
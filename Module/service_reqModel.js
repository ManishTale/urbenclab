const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Servicerequest = new Schema({
    service_id: {type: Schema.Types.ObjectId, 
        ref: 'services',
        required: true
    },
    user_id: {type: Schema.Types.ObjectId,
         ref: 'users',
         required: true
    },
    details: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
    
});
module.exports = mongoose.model('servicerequests', Servicerequest);
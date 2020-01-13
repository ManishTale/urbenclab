const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
    service_req_id: {type: Schema.Types.ObjectId,
         ref: 'servicerequests',
         required: true
    },
    user_id: {type: Schema.Types.ObjectId,
         ref: 'users',
         required: true
    },
    comment: {
        type: String,
        required: true
    },

});
module.exports = mongoose.model('comments', Comment);
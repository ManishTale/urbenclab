const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Service = new Schema({
    name: {
        type: String,
        required: true
    },
    provider_id: {
        type: Schema.Types.ObjectId, 
        ref: 'users',
        required: true
    }
    
});
module.exports = mongoose.model('services', Service);
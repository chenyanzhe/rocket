var mongoose = require('mongoose');

var subscriptionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    subscriptionId: String,
    displayName: String,
    state: String
});

mongoose.model('Subscription', subscriptionSchema);
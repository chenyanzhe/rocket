var mongoose = require('mongoose');

var locationSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: String,
    displayName: String,
    longitude: String,
    latitude: String
});

locationSchema.index({ name: 1 });

mongoose.model('Location', locationSchema);

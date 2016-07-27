var mongoose = require('mongoose');

var dailyCostSchema = new mongoose.Schema({
    subscriptionId: {
        type: String,
        required: true
    },
    resourceGroup: {
        type: String,
        required: true
    },
    resourceType: {
        type: String,
        required: true
    },
    resourceName: {
        type: String,
        required: true
    },
    usageStartTime: {
        type: Date,
        required: true
    },
    usageEndTime: {
        type: Date,
        required: true
    },
    cost: {
        type: Number,
        required: true
    }
});

mongoose.model('DailyCost', dailyCostSchema);

dailyCostSchema.index({ subscriptionId: 1, resourceGroup: 1, resourceType: 1, resourceName: 1, usageStartTime: 1, usageEndTime: 1 });
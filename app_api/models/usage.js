var mongoose = require('mongoose');

// ARM
// /subscriptions/c4528d9e-c99a-48bb-b12d-fde2176a43b8/resourceGroups/ICA-RG-Template-bosh-cf-deployment-7-14-19-19-58/providers/Microsoft.Network/publicIPAddresses/devbox-7-14-19-19-58-cf
// subscriptionId = c4528d9e-c99a-48bb-b12d-fde2176a43b8
// resourceGroups = ICA-RG-Template-bosh-cf-deployment-7-14-19-19-58
// resourceType = Microsoft.Network/publicIPAddresses
// resourceName = devbox-7-14-19-19-58-cf

// CLASSIC
// "infoFields": {"meteredRegion": "East Asia",
//                "meteredService": "Storage",
//                "meteredServiceType": "",
//                "project": "thomasmondemo"}
// resourceGroups = classic
// resourceType = Storage
// resourceName = thomasmondemo

var hourlyUsageSchema = new mongoose.Schema({
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
    meterId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reportedStartTime: {
        type: Date,
        required: true
    },
    reportedEndTime: {
        type: Date,
        required: true
    }
});

var dailyUsageSchema = new mongoose.Schema({
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
    meterId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reportedStartTime: {
        type: Date,
        required: true
    },
    reportedEndTime: {
        type: Date,
        required: true
    }
});

// for insert
hourlyUsageSchema.index({ subscriptionId: 1, resourceGroup: 1, resourceType: 1, resourceName: 1, usageStartTime: 1, usageEndTime: 1, meterId: 1 });
// for query
hourlyUsageSchema.index({ subscriptionId: 1, usageStartTime: 1 });

mongoose.model('HourlyUsage', hourlyUsageSchema);

// for insert
dailyUsageSchema.index({ subscriptionId: 1, resourceGroup: 1, resourceType: 1, resourceName: 1, usageStartTime: 1, usageEndTime: 1, meterId: 1 });
// for query
dailyUsageSchema.index({ subscriptionId: 1, usageStartTime: 1 });

mongoose.model('DailyUsage', dailyUsageSchema);